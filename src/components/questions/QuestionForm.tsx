"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TiptapEditor from "@/components/questions/TiptapEditor";
import { X } from "lucide-react";
import { useQuestionFormStore } from "@/store";

interface TagSuggestion {
  name: string;
  confidence: number;
  usage_count: number;
}

interface QuestionFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string | React.ReactNode;
  className?: string;
  // AI Integration props
  aiSuggestedTags?: TagSuggestion[];
}

export default function QuestionForm({
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Post Your Question",
  className = "",
  aiSuggestedTags = [],
}: QuestionFormProps) {
  const {
    formData,
    tagInput,
    isAnalyzing,
    suggestions,
    error: aiError,
    hasDraft,
    isDraftLoading,
    isDraftSaving,
    lastSaved,
    draftError,
    setTitle,
    setContent,
    addTag,
    removeTag,
    setTagInput,
    triggerAIAnalysis,
    applyAITag,
    validateForm,
    canTriggerAI,
    loadDraft,
    discardDraft,
  } = useQuestionFormStore();

  const [formErrors, setFormErrors] = React.useState<string[]>([]);

  const handleContentChange = (json: any, html?: string) => {
    setContent(json, html);
    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent Enter key from submitting the form
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleAddTag = (tagToAdd?: string) => {
    const tagValue = tagToAdd || tagInput;
    addTag(tagValue);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAddTag();
    }
    // Handle backspace to remove last tag if input is empty
    if (e.key === "Backspace" && !tagInput && formData.tags.length > 0) {
      e.preventDefault();
      removeTag(formData.tags[formData.tags.length - 1]);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if user typed a space - if so, add the tag
    if (value.endsWith(" ") && value.trim()) {
      handleAddTag(value.trim());
    } else {
      setTagInput(value);
    }
  };

  const handleTagInputFocus = async () => {
    await triggerAIAnalysis();
  };

  const handleDiscardDraft = async () => {
    if (
      window.confirm(
        "Are you sure you want to discard your draft? This action cannot be undone."
      )
    ) {
      await discardDraft();
    }
  };

  // Load draft on component mount
  React.useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors } = validateForm();
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    // Clear errors if validation passes
    setFormErrors([]);
    await onSubmit(formData);
  };

  const { isValid } = validateForm();

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Form Errors */}
      {formErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h3>
              <div className="mt-2">
                <ul className="text-sm text-red-700 space-y-1">
                  {formErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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
              value={formData.title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              className="text-base h-12 border-gray-300 focus:border-gray-300 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300 focus-visible:outline-none"
              maxLength={150}
              required
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {formData.title.length}/150 characters
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
          value={formData.contentHtml}
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

        {/* Tag Input with chips inside */}
        <div className="relative group">
          <div className="relative border-2 border-transparent rounded group-focus-within:border-blue-500 transition-colors p-0.5">
            <div className="relative border border-gray-300 rounded bg-white min-h-[48px] flex items-center flex-wrap gap-1 p-2">
              {/* Search Icon */}
              <div className="flex items-center pointer-events-none">
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

              {/* Tag chips inside input */}
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex justify-between items-center px-2 py-1 bg-gray-300 text-gray-800 rounded text-sm "
                >
                  <span className="mr-3">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="flex items-center justify-center w-4 h-4 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Input field */}
              <input
                type="text"
                placeholder={
                  formData.tags.length === 0
                    ? "e.g. (ruby-on-rails arrays typescript)"
                    : "Add more tags..."
                }
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyPress}
                onFocus={handleTagInputFocus}
                className="flex-1 min-w-[200px] border-0 outline-none bg-transparent text-base px-1"
                disabled={formData.tags.length >= 5}
              />
            </div>
          </div>
        </div>

        {/* Suggested Tags - Only show when AI provides suggestions */}
        {aiSuggestedTags.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <span>suggested tags:</span>
            <div className="flex flex-wrap gap-1">
              {aiSuggestedTags.map((tag) => (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => applyAITag(tag.name)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs hover:bg-blue-100 transition-colors"
                  title={`${Math.round(
                    tag.confidence * 100
                  )}% confidence, ${tag.usage_count.toLocaleString()} uses`}
                  disabled={
                    formData.tags.includes(tag.name.toLowerCase()) ||
                    formData.tags.length >= 5
                  }
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Tags count - Remove the separate tags display since they're now inside input */}
        <div className="text-xs text-gray-500 mt-2">
          {formData.tags.length}/5 tags selected
        </div>
      </div>

      {/* Draft Status and Actions */}
      {(hasDraft || isDraftSaving || draftError) && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            {isDraftSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Saving draft...</span>
              </>
            ) : draftError ? (
              <>
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-sm text-red-600">{draftError}</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  Draft saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              </>
            )}
          </div>

          {hasDraft && !isDraftSaving && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardDraft}
              className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20"
            >
              Discard draft
            </Button>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
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
