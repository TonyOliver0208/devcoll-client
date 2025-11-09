"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Code,
  Code2,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ExternalLink,
  Edit,
  Trash2,
  ImageIcon,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect, useState, useRef } from "react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import toast from "react-hot-toast";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";

// Configure lowlight for code highlighting
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);
lowlight.register("java", java);
lowlight.register("css", css);
lowlight.register("html", html);

// URL validation function
const isValidUrl = (string: string): boolean => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

// Custom Link extension with proper cursor behavior at edges
const CustomLink = Link.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      openOnClick: false,
      linkOnPaste: false,
      HTMLAttributes: {
        class: "text-blue-600 underline hover:text-blue-800 cursor-pointer",
        target: "",
        rel: "",
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      // Handle typing at link boundaries - prevent link extension
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;

        if (selection.empty) {
          const { $from } = selection;
          const linkMark = $from
            .marks()
            .find((mark) => mark.type === this.type);

          // If we're in a link and at the beginning, remove link mark for next character
          if (linkMark && $from.parentOffset <= 1) {
            return false; // Let normal backspace work, but prepare to unset mark
          }
        }
        return false;
      },
    };
  },

  onCreate() {
    // Override the default behavior to handle cursor positioning
    this.editor.on("selectionUpdate", ({ editor }) => {
      const { selection } = editor.state;
      const { $from } = selection;

      if (selection.empty) {
        const linkMark = $from.marks().find((mark) => mark.type === this.type);

        if (linkMark) {
          const start = $from.pos - $from.parentOffset;
          const end = start + $from.parent.content.size;

          // If cursor is at the very beginning (position 0) or very end of the link
          if ($from.pos === start || $from.pos === end) {
            // Remove link mark from stored marks for future input
            const tr = editor.state.tr;
            tr.removeStoredMark(linkMark.type);
            editor.view.dispatch(tr);
          }
        }
      }
    });
  },
});

export interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
  alt: string;
}

interface TiptapEditorProps {
  value?: string;
  onChange: (json: any, html?: string, pendingImages?: PendingImage[]) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const TiptapEditor = ({
  value = "",
  onChange,
  placeholder = "Write your answer here...",
  className = "",
  minHeight = "min-h-48",
}: TiptapEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkPopupOpen, setLinkPopupOpen] = useState(false);
  const [linkPopupPosition, setLinkPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedLinkUrl, setSelectedLinkUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const linkPopupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle click outside for link popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        linkPopupRef.current &&
        !linkPopupRef.current.contains(event.target as Node)
      ) {
        setLinkPopupOpen(false);
      }
    };

    if (linkPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [linkPopupOpen]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CustomLink, // Use custom link extension instead of default
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            "rounded-lg bg-slate-100 border border-slate-200 p-4 font-mono text-sm",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getHTML(), pendingImages);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${minHeight} p-4`,
      },
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target as HTMLElement;
          const linkEl = target.closest("a");

          if (linkEl && linkEl.tagName === "A") {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            const href = linkEl.getAttribute("href");
            if (href) {
              const rect = linkEl.getBoundingClientRect();
              setLinkPopupPosition({
                x: rect.left + rect.width / 2,
                y: rect.bottom + window.scrollY + 5,
              });
              setSelectedLinkUrl(href);
              setLinkPopupOpen(true);
            }
            return true; // Prevent further processing
          }

          setLinkPopupOpen(false); // Close popup if clicking elsewhere
          return false;
        },
      },
      handleClickOn: (view, pos, node, nodePos, event, direct) => {
        if (node.marks?.some((mark) => mark.type.name === "link")) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          const linkMark = node.marks.find((mark) => mark.type.name === "link");
          const href = linkMark?.attrs?.href || "";

          if (href) {
            const domAtPos = view.domAtPos(pos);
            const linkEl = (domAtPos.node as HTMLElement)?.closest("a");

            if (linkEl) {
              const rect = linkEl.getBoundingClientRect();
              setLinkPopupPosition({
                x: rect.left + rect.width / 2,
                y: rect.bottom + window.scrollY + 5,
              });
              setSelectedLinkUrl(href);
              setLinkPopupOpen(true);
            }
          }

          return true; // Stop further processing
        }

        setLinkPopupOpen(false); // Close popup if clicking elsewhere
        return false;
      },
    },
    immediatelyRender: false,
  });

  // Ultimate failsafe: Global document click interceptor for any links in the editor
  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;

    const globalClickHandler = (event: Event) => {
      const target = event.target as HTMLElement;

      // Check if the click originated from within the editor
      if (editorElement.contains(target)) {
        const linkElement = target.closest("a");

        if (linkElement && linkElement.getAttribute("href")) {
          console.log("🔥 GLOBAL INTERCEPTOR: Preventing link navigation!");
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          const href = linkElement.getAttribute("href");

          if (href) {
            const rect = linkElement.getBoundingClientRect();

            setLinkPopupPosition({
              x: rect.left + rect.width / 2,
              y: rect.bottom + window.scrollY + 5,
            });
            setSelectedLinkUrl(href);
            setLinkPopupOpen(true);
          }
        }
      }
    };

    // Capture phase to intercept before any other handlers
    document.addEventListener("click", globalClickHandler, true);

    return () => {
      document.removeEventListener("click", globalClickHandler, true);
    };
  }, [editor]);

  // Sync editor content with value prop (for draft loading)
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== value) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    const existingLink = editor.getAttributes("link");

    setLinkUrl(existingLink.href || "");
    setLinkText(selectedText || "");
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkSave = () => {
    if (!editor) return;
    setUrlError("");

    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      if (!isValidUrl(linkUrl.trim())) {
        setUrlError(
          "Please enter a valid URL (must start with http:// or https://)"
        );
        return;
      }

      if (linkText.trim() && editor.state.selection.empty) {
        const linkContent = {
          type: "text",
          text: linkText,
          marks: [{ type: "link", attrs: { href: linkUrl.trim() } }],
        };
        editor.chain().focus().insertContent(linkContent).run();
        editor.chain().focus().unsetMark("link").insertContent(" ").run();
      } else {
        const { from, to } = editor.state.selection;
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: linkUrl.trim() })
          .run();
        editor
          .chain()
          .focus()
          .setTextSelection(to)
          .unsetMark("link")
          .insertContent(" ")
          .run();
      }
    }

    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
    setUrlError("");
  };

  const handleLinkCancel = () => {
    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
    setUrlError("");
  };

  const handleVisitLink = () => {
    if (selectedLinkUrl) {
      window.open(selectedLinkUrl, "_blank", "noopener,noreferrer");
    }
    setLinkPopupOpen(false);
  };

  const handleEditLink = () => {
    if (!editor) return;

    const { state } = editor;
    const { doc } = state;
    let linkText = "";

    doc.descendants((node, pos) => {
      if (
        node.isText &&
        node.marks.some(
          (mark) =>
            mark.type.name === "link" && mark.attrs.href === selectedLinkUrl
        )
      ) {
        linkText = node.text || "";
        return false;
      }
    });

    setLinkUrl(selectedLinkUrl);
    setLinkText(linkText);
    setLinkPopupOpen(false);
    setLinkDialogOpen(true);
  };

  const handleDeleteLink = () => {
    if (!editor) return;

    const { state } = editor;
    const { doc } = state;

    doc.descendants((node, pos) => {
      if (
        node.isText &&
        node.marks.some(
          (mark) =>
            mark.type.name === "link" && mark.attrs.href === selectedLinkUrl
        )
      ) {
        const linkMark = node.marks.find(
          (mark) =>
            mark.type.name === "link" && mark.attrs.href === selectedLinkUrl
        );
        if (linkMark) {
          const from = pos;
          const to = pos + node.nodeSize;
          editor
            .chain()
            .focus()
            .setTextSelection({ from, to })
            .unsetLink()
            .run();
        }
        return false;
      }
    });

    setLinkPopupOpen(false);
  };

  const addCodeBlock = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  // Handle image file selection - show preview dialog
  const handleImageFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setSelectedImageFile(file);
    setImageAltText('');
    setImageDialogOpen(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle image upload confirmation - store as pending, don't upload yet
  const handleImageUploadConfirm = useCallback(() => {
    if (!editor || !selectedImageFile) return;

    // Generate unique ID for this image
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create pending image object
    const pendingImage: PendingImage = {
      id: imageId,
      file: selectedImageFile,
      previewUrl: imagePreviewUrl,
      alt: imageAltText || selectedImageFile.name,
    };
    
    // Add to pending images list
    const updatedPendingImages = [...pendingImages, pendingImage];
    setPendingImages(updatedPendingImages);
    
    // Insert placeholder link in editor
    const linkText = imageAltText || selectedImageFile.name;
    editor.chain().focus().insertContent([
      {
        type: 'text',
        text: '[',
      },
      {
        type: 'text',
        text: `📷 ${linkText}`,
        marks: [
          {
            type: 'link',
            attrs: {
              href: `#image:${imageId}`,
              class: 'image-placeholder text-blue-600 underline',
            },
          },
        ],
      },
      {
        type: 'text',
        text: ']',
      },
      {
        type: 'text',
        text: ' ',
      },
    ]).run();
    
    // Notify parent component about the updated images
    onChange(editor.getJSON(), editor.getHTML(), updatedPendingImages);
    
    toast.success(`Image "${linkText}" added (will upload when you save)`);
    
    // Clean up
    setImageDialogOpen(false);
    setSelectedImageFile(null);
    setImageAltText('');
    // Don't revoke preview URL - we need it until upload
  }, [editor, selectedImageFile, imageAltText, imagePreviewUrl, pendingImages, onChange]);

  // Handle image dialog cancel
  const handleImageDialogCancel = useCallback(() => {
    setImageDialogOpen(false);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl('');
    setSelectedImageFile(null);
    setImageAltText('');
  }, [imagePreviewUrl]);

  // Trigger file input click
  const triggerImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!isMounted) {
    return (
      <div className="relative group">
        <div
          className={`relative border-2 border-transparent rounded group-focus-within:border-blue-500 transition-colors p-0.5 ${className}`}
        >
          <div className="relative border border-gray-300 rounded bg-white">
            <div className="border-b border-gray-200 bg-gray-50 p-2 rounded-t">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className={`p-4 ${minHeight} bg-gray-50 rounded-b`}>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="relative group">
      <div
        className={`relative border-2 border-transparent rounded group-focus-within:border-blue-500 transition-colors p-0.5 ${className}`}
      >
        <div className="relative border border-gray-300 rounded bg-white">
          {/* Toolbar */}
          <div className="border-b border-gray-200 bg-gray-50 p-2 flex items-center gap-1 flex-wrap rounded-xl">
            {/* Heading Selector */}
            <Select
              value={
                editor.isActive("heading", { level: 1 })
                  ? "h1"
                  : editor.isActive("heading", { level: 2 })
                  ? "h2"
                  : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : "paragraph"
              }
              onValueChange={(value) => {
                if (value === "paragraph") {
                  editor.chain().focus().setParagraph().run();
                } else if (value === "h1") {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                } else if (value === "h2") {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                } else if (value === "h3") {
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                }
              }}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraph">Paragraph</SelectItem>
                <SelectItem value="h1">Heading 1</SelectItem>
                <SelectItem value="h2">Heading 2</SelectItem>
                <SelectItem value="h3">Heading 3</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Text Formatting Group */}
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant={editor.isActive("bold") ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  editor.isActive("bold")
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold ⌘B"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("italic") ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  editor.isActive("italic")
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic ⌘I"
              >
                <Italic className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Code Group */}
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant={editor.isActive("code") ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  editor.isActive("code")
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => editor.chain().focus().toggleCode().run()}
                title="Inline Code ⌘E"
              >
                <Code className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("codeBlock") ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  editor.isActive("codeBlock")
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-200"
                }`}
                onClick={addCodeBlock}
                title="Code Block ⌘⇧E"
              >
                <Code2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Link, Image & Quote Group */}
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant={editor.isActive("link") ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  editor.isActive("link")
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-200"
                }`}
                onClick={setLink}
                title="Link ⌘K"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200"
                onClick={triggerImageUpload}
                title="Add Image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("blockquote") ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  editor.isActive("blockquote")
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Quote ⌘⇧B"
              >
                <Quote className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Lists Group */}
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant={editor.isActive("bulletList") ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  editor.isActive("bulletList")
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet List ⌘⇧8"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={editor.isActive("orderedList") ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  editor.isActive("orderedList")
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Numbered List ⌘⇧7"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Undo/Redo Group */}
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo ⌘Z"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo ⌘Y"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <EditorContent editor={editor} className="prose-editor-content" />

          {/* Hidden File Input for Image Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFileSelect}
            className="hidden"
          />

          {/* Link Dialog */}
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="link-url">Link URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://"
                    value={linkUrl}
                    onChange={(e) => {
                      setLinkUrl(e.target.value);
                      setUrlError(""); // Clear error when user types
                    }}
                    autoFocus
                    className={
                      urlError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {urlError && (
                    <p className="text-sm text-red-600">{urlError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-text">Link text</Label>
                  <Input
                    id="link-text"
                    placeholder="Enter link text (optional)"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleLinkCancel}>
                  Cancel
                </Button>
                <Button onClick={handleLinkSave} disabled={!linkUrl.trim()}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Image Preview Dialog */}
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Image Preview */}
                {imagePreviewUrl && (
                  <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                )}
                {/* Alt Text Input */}
                <div className="space-y-2">
                  <Label htmlFor="image-alt">
                    Image Description (Alt Text)
                  </Label>
                  <Input
                    id="image-alt"
                    placeholder="Describe the image (e.g., 'Screenshot of error code')"
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    This description will appear as a link in the editor. Image uploads when you save the post.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleImageDialogCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImageUploadConfirm}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Image Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Link Popup */}
          {linkPopupOpen && (
            <div
              ref={linkPopupRef}
              className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl px-3 py-1"
              style={{
                left: `${linkPopupPosition.x}px`,
                top: `${linkPopupPosition.y}px`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="text-sm text-blue-600 truncate max-w-[250px] cursor-pointer"
                  onClick={handleVisitLink}
                  title={selectedLinkUrl}
                >
                  {selectedLinkUrl}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-blue-50"
                  onClick={handleEditLink}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                  onClick={handleDeleteLink}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          <style jsx global>{`
            .ProseMirror {
              outline: none;
            }

            .ProseMirror p.is-editor-empty:first-child::before {
              color: #adb5bd;
              content: attr(data-placeholder);
              float: left;
              height: 0;
              pointer-events: none;
            }

            .ProseMirror h1 {
              font-size: 2rem;
              font-weight: 700;
              line-height: 1.1;
              margin-top: 2rem;
              margin-bottom: 1rem;
            }

            .ProseMirror h2 {
              font-size: 1.5rem;
              font-weight: 600;
              line-height: 1.3;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
            }

            .ProseMirror h3 {
              font-size: 1.25rem;
              font-weight: 600;
              line-height: 1.4;
              margin-top: 1.25rem;
              margin-bottom: 0.5rem;
            }

            .ProseMirror blockquote {
              border-left: 4px solid #e5e7eb;
              padding-left: 1rem;
              margin: 1.5rem 0;
              font-style: italic;
              color: #6b7280;
            }

            .ProseMirror code {
              background-color: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 0.25rem;
              padding: 0.125rem 0.375rem;
              font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
              font-size: 0.875rem;
              color: #1e293b;
            }

            .ProseMirror pre {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 0.5rem;
              padding: 1rem;
              margin: 1rem 0;
              overflow-x: auto;
              font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
              font-size: 0.875rem;
              line-height: 1.5;
            }

            .ProseMirror pre code {
              background: none;
              border: none;
              padding: 0;
              color: inherit;
            }

            .ProseMirror ul,
            .ProseMirror ol {
              margin: 1rem 0;
              padding-left: 2rem;
            }

            .ProseMirror ul {
              list-style-type: disc;
            }

            .ProseMirror ol {
              list-style-type: decimal;
            }

            .ProseMirror li {
              margin: 0.5rem 0;
              display: list-item;
            }

            .ProseMirror ul ul {
              list-style-type: circle;
            }

            .ProseMirror ul ul ul {
              list-style-type: square;
            }

            .ProseMirror img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5rem;
              margin: 1rem 0;
              display: block;
              box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
              cursor: pointer;
            }

            .ProseMirror img:hover {
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }

            .ProseMirror img.ProseMirror-selectednode {
              outline: 3px solid #3b82f6;
              outline-offset: 2px;
            }

            .ProseMirror a {
              color: #2563eb;
              text-decoration: underline;
              cursor: pointer;
              /* Completely disable default link behavior */
              pointer-events: none;
            }

            .ProseMirror a:hover {
              color: #1d4ed8;
            }

            /* Re-enable pointer events for TipTap to handle clicks */
            .ProseMirror {
              pointer-events: auto;
            }

            /* Override any other pointer events */
            .ProseMirror a {
              pointer-events: auto !important;
            }

            /* Disable native link behavior completely */
            .ProseMirror a[href] {
              -webkit-user-drag: none;
              -webkit-user-select: none;
              user-select: none;
            }

            /* Code block syntax highlighting */
            .hljs-comment,
            .hljs-quote {
              color: #6b7280;
            }

            .hljs-variable,
            .hljs-template-variable,
            .hljs-tag,
            .hljs-name,
            .hljs-selector-id,
            .hljs-selector-class,
            .hljs-regexp,
            .hljs-deletion {
              color: #dc2626;
            }

            .hljs-number,
            .hljs-built_in,
            .hljs-builtin-name,
            .hljs-literal,
            .hljs-type,
            .hljs-params,
            .hljs-meta,
            .hljs-link {
              color: #ea580c;
            }

            .hljs-attribute {
              color: #d97706;
            }

            .hljs-string,
            .hljs-symbol,
            .hljs-bullet,
            .hljs-addition {
              color: #16a34a;
            }

            .hljs-title,
            .hljs-section {
              color: #2563eb;
            }

            .hljs-keyword,
            .hljs-selector-tag {
              color: #7c3aed;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;
