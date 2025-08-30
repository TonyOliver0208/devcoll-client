"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TiptapEditor from "@/components/questions/TiptapEditor";
import { X } from "lucide-react";

interface QuestionFormData {
  title: string;
  content: any;
  contentHtml: string;
  tags: string[];
}

interface QuestionFormProps {
  initialData?: Partial<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string | React.ReactNode;
  className?: string;
  // AI Integration props
  onTriggerAI?: (title: string, description: string) => void;
  onTagInputFocus?: () => void;
}

export default function QuestionForm({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Post Your Question",
  className = "",
  onTriggerAI,
  onTagInputFocus,
}: QuestionFormProps) {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState<any>(initialData.content || null);
  const [contentHtml, setContentHtml] = useState(initialData.contentHtml || "");
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [tagInput, setTagInput] = useState("");

  const handleContentChange = (json: any, html?: string) => {
    setContent(json);
    if (html) setContentHtml(html);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  // Function to add tag programmatically (from AI suggestions)
  const addTagFromSuggestion = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleTagInputFocus = () => {
    // Trigger AI analysis when user focuses on tags input
    // Only if title and content are filled
    if (title.trim() && contentHtml.trim()) {
      onTriggerAI?.(title, contentHtml);
    }
    onTagInputFocus?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content || tags.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    await onSubmit({
      title: title.trim(),
      content,
      contentHtml,
      tags,
    });
  };

  const isFormValid = title.trim() && content && tags.length > 0;

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Title */}
      <div className="space-y-2">
        <Label
          htmlFor="title"
          className="text-base font-medium text-gray-900 flex items-center gap-1"
        >
          Title
          <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">
          Be specific and imagine you're asking a question to another person.
          Min 15 characters.
        </p>
        <div className="relative group">
          <div className="relative border-2 border-transparent rounded group-focus-within:border-blue-500 transition-colors p-0.5">
            <Input
              id="title"
              type="text"
              placeholder="e.g. How to center a div in CSS?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base h-12 border-gray-300 focus:border-gray-300 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 focus-visible:outline-none"
              maxLength={150}
              required
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {title.length}/150 characters
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <Label className="text-base font-medium text-gray-900 flex items-center gap-1">
          Body
          <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">
          Include all the information someone would need to answer your
          question. Min 220 characters.
        </p>
        <TiptapEditor
          value=""
          onChange={handleContentChange}
          placeholder="Describe your problem in detail..."
          minHeight="min-h-80"
          className="border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-base font-medium text-gray-900 flex items-center gap-1">
          Tags
          <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">
          Add up to 5 tags to describe what your question is about. Start typing
          to see suggestions.
        </p>

        {/* Tag Input */}
        <div className="relative group">
          <div className="relative border-2 border-transparent rounded group-focus-within:border-blue-500 transition-colors p-0.5">
            <div className="relative border border-gray-300 rounded bg-white">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="e.g. (ruby-on-rails arrays typescript)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                onFocus={handleTagInputFocus}
                className="pl-10 h-12 border-0 focus:border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:outline-none"
                disabled={tags.length >= 5}
              />
            </div>
          </div>
        </div>

        {/* Suggested Tags */}
        <div className="text-xs text-gray-500 mt-2">
          suggested tags: 
          <span className="ml-1 text-blue-600">
            sequelize.js, node.js, mysql, postgresql
          </span>
        </div>

        {/* Selected Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-blue-200 rounded-full p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          {tags.length}/5 tags selected
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="bg-blue-600 hover:bg-blue-700 px-6 h-10 text-sm font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Posting...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
}
