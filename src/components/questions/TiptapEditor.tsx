"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { createLowlight } from 'lowlight'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCallback, useEffect, useState } from 'react'

// Configure lowlight for code highlighting
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'

const lowlight = createLowlight()
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('python', python)
lowlight.register('java', java)
lowlight.register('css', css)
lowlight.register('html', html)

interface TiptapEditorProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

const TiptapEditor = ({
  value = '',
  onChange,
  placeholder = 'Write your answer here...',
  className = '',
  minHeight = 'min-h-48',
}: TiptapEditorProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use the lowlight version instead
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg bg-slate-100 border border-slate-200 p-4 font-mono text-sm',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${minHeight} p-4`,
      },
    },
    immediatelyRender: false,
  })

  const setLink = useCallback(() => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)
    
    // Get existing link if we're editing one
    const existingLink = editor.getAttributes('link')
    
    setLinkUrl(existingLink.href || '')
    setLinkText(selectedText || '')
    setLinkDialogOpen(true)
  }, [editor])

  const handleLinkSave = () => {
    if (!editor) return

    if (!linkUrl.trim()) {
      // Remove link if URL is empty
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      // If there's link text and no current selection, insert text with link
      if (linkText.trim() && editor.state.selection.empty) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: linkText,
            marks: [{ type: 'link', attrs: { href: linkUrl } }]
          })
          .run()
      } else {
        // Apply/update link to current selection
        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
      }
    }

    // Reset dialog state
    setLinkDialogOpen(false)
    setLinkUrl('')
    setLinkText('')
  }

  const handleLinkCancel = () => {
    setLinkDialogOpen(false)
    setLinkUrl('')
    setLinkText('')
  }

  const addCodeBlock = useCallback(() => {
    if (!editor) return
    editor.chain().focus().toggleCodeBlock().run()
  }, [editor])

  if (!isMounted) {
    return (
      <div className={`border border-gray-300 rounded-md ${className}`}>
        <div className="border-b border-gray-200 bg-gray-50 p-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className={`p-4 ${minHeight} bg-gray-50 rounded-b-md`}>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!editor) {
    return null
  }

  return (
    <div className={`border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex items-center gap-1 flex-wrap">
        {/* Heading Selector */}
        <Select
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1' :
            editor.isActive('heading', { level: 2 }) ? 'h2' :
            editor.isActive('heading', { level: 3 }) ? 'h3' :
            'paragraph'
          }
          onValueChange={(value) => {
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run()
            } else if (value === 'h1') {
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            } else if (value === 'h2') {
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            } else if (value === 'h3') {
              editor.chain().focus().toggleHeading({ level: 3 }).run()
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
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 w-8 p-0 ${
              editor.isActive('bold')
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'hover:bg-gray-200'
            }`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold ⌘B"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 w-8 p-0 ${
              editor.isActive('italic')
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'hover:bg-gray-200'
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
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 w-8 p-0 ${
              editor.isActive('code')
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'hover:bg-gray-200'
            }`}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline Code ⌘E"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 w-8 p-0 ${
              editor.isActive('codeBlock')
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'hover:bg-gray-200'
            }`}
            onClick={addCodeBlock}
            title="Code Block ⌘⇧E"
          >
            <Code2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link & Quote Group */}
        <div className="flex items-center gap-0.5">
          <Button
            variant={editor.isActive('link') ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 w-8 p-0 ${
              editor.isActive('link')
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'hover:bg-gray-200'
            }`}
            onClick={setLink}
            title="Link ⌘K"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 w-8 p-0 ${
              editor.isActive('blockquote')
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'hover:bg-gray-200'
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
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 w-8 p-0 ${
              editor.isActive('bulletList')
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'hover:bg-gray-200'
            }`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List ⌘⇧8"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 w-8 p-0 ${
              editor.isActive('orderedList')
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'hover:bg-gray-200'
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
      <EditorContent 
        editor={editor} 
        className="prose-editor-content"
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
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
              />
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
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .ProseMirror pre code {
          background: none;
          border: none;
          padding: 0;
          color: inherit;
        }

        .ProseMirror ul, .ProseMirror ol {
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

        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          color: #1d4ed8;
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
  )
}

export default TiptapEditor
