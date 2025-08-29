"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TiptapEditor from "./TiptapEditor";
import { validateAnswerQuality, ANSWER_QUALITY_RULES } from "@/lib/answerQualityRules";
import TermsOfServiceDialog from "@/components/legal/TermsOfServiceDialog";
import PrivacyPolicyDialog from "@/components/legal/PrivacyPolicyDialog";

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
  const [qualityCheck, setQualityCheck] = useState<{
    errors: string[];
    warnings: string[];
    score: number;
  }>({ errors: [], warnings: [], score: 0 });

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
    
    // Run quality check on content change
    if (html && html.trim().length > 0) {
      const validation = validateAnswerQuality(html, json);
      setQualityCheck(validation);
    } else {
      setQualityCheck({ errors: [], warnings: [], score: 0 });
    }
  };

  const handleSubmit = async () => {
    if (!content || !contentHtml.trim()) return;

    // Block submission if there are critical errors
    if (qualityCheck.errors.length > 0) {
      return; // Errors are displayed in UI, prevent submission
    }

    try {
      await onSubmit?.(content);
      setContent(null);
      setContentHtml("");
      setQualityCheck({ errors: [], warnings: [], score: 0 });
      localStorage.removeItem(`draft_${questionId}`);
      setDraftSaved(false);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleDiscard = () => {
    setContent(null);
    setContentHtml("");
    setQualityCheck({ errors: [], warnings: [], score: 0 });
    localStorage.removeItem(`draft_${questionId}`);
    setDraftSaved(false);
  };

  const isValid = contentHtml.trim().length >= ANSWER_QUALITY_RULES.minLength && qualityCheck.errors.length === 0;

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

        {/* Quality Feedback */}
        {qualityCheck.errors.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
            <div className="font-medium text-red-800 mb-2">Please fix these issues:</div>
            <ul className="text-red-700 space-y-1">
              {qualityCheck.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {qualityCheck.warnings.length > 0 && qualityCheck.errors.length === 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <div className="font-medium text-yellow-800 mb-2">Suggestions to improve your answer:</div>
            <ul className="text-yellow-700 space-y-1">
              {qualityCheck.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quality Score Indicator */}
        {contentHtml.length > 0 && (
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Answer Quality:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-lg ${i < Math.floor(qualityCheck.score / 2) ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-1">({qualityCheck.score.toFixed(1)}/10)</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {contentHtml.replace(/<[^>]*>/g, '').trim().length} characters
            </div>
          </div>
        )}

        {/* Guidelines Panel */}
        {contentHtml.length === 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="font-medium text-blue-800 mb-2">Writing a Great Answer:</div>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>✓ Provide a complete, working solution</li>
              <li>✓ Explain WHY your solution works, not just HOW</li>
              <li>✓ Include code examples when applicable</li>
              <li>✓ Break down complex solutions into steps</li>
              <li>✓ Test your code before posting</li>
              <li>✓ Cite sources and documentation</li>
            </ul>
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
          <TermsOfServiceDialog>
            <button className="text-blue-600 hover:text-blue-800 underline focus:outline-none">
              terms of service
            </button>
          </TermsOfServiceDialog>{" "}
          and{" "}
          <PrivacyPolicyDialog>
            <button className="text-blue-600 hover:text-blue-800 underline focus:outline-none">
              privacy policy
            </button>
          </PrivacyPolicyDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default YourAnswer;
