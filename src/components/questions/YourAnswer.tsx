"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TiptapEditor from "./TiptapEditor";

interface YourAnswerProps {
  questionId: string;
  onSubmit?: (content: any) => void; // Changed to any to support JSON
  isSubmitting?: boolean;
  className?: string;
}

const YourAnswer = ({
  questionId,
  onSubmit,
  isSubmitting = false,
  className = "",
}: YourAnswerProps) => {
  const [content, setContent] = useState<any>(null);
  const [contentHtml, setContentHtml] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem(`draft_${questionId}`);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setContent(parsedDraft.json);
        setContentHtml(parsedDraft.html || "");
        setDraftSaved(true);
      } catch (error) {
        // Fallback for old text-based drafts
        setContentHtml(savedDraft);
        setDraftSaved(true);
      }
    }
  }, [questionId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentHtml.trim()) {
        localStorage.setItem(`draft_${questionId}`, JSON.stringify({
          json: content,
          html: contentHtml
        }));
        setDraftSaved(true);
      } else {
        localStorage.removeItem(`draft_${questionId}`);
        setDraftSaved(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, contentHtml, questionId]);

  const handleEditorChange = (json: any, html?: string) => {
    setContent(json);
    if (html) setContentHtml(html);
  };

  const handleSubmit = async () => {
    if (!content || !contentHtml.trim()) return;

    try {
      await onSubmit?.(content);
      setContent(null);
      setContentHtml("");
      localStorage.removeItem(`draft_${questionId}`);
      setDraftSaved(false);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleDiscard = () => {
    setContent(null);
    setContentHtml("");
    localStorage.removeItem(`draft_${questionId}`);
    setDraftSaved(false);
  };

  const isValid = contentHtml.trim().length >= 30;

  return (
    <Card className={`mt-6 sm:mt-8 ${className}`}>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-normal mb-4">Your Answer</h3>

        <TiptapEditor
          value={contentHtml}
          onChange={handleEditorChange}
          placeholder="Enter your answer here. Be specific and explain your reasoning. Include code examples if relevant."
          minHeight="min-h-48"
        />

        {contentHtml.length > 0 && contentHtml.length < 30 && (
          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            Please provide a more detailed answer (at least 30 characters).
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post Your Answer"}
            </Button>
            <Button
              variant="link"
              className="text-red-600 hover:text-red-800"
              onClick={handleDiscard}
            >
              Discard
            </Button>
          </div>
          {draftSaved && (
            <div className="text-green-600 text-sm">Draft saved</div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          By posting your answer, you agree to our{" "}
          <a
            href="/terms"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            terms of service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            privacy policy
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default YourAnswer;
