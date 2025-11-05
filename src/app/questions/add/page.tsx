"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import QuestionForm from "@/components/questions/QuestionForm";
import AIAssistantPanel from "@/components/questions/AIAssistantPanel";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useQuestionFormStore } from "@/store";
import { useCreateQuestion } from "@/hooks/use-questions";
import { handleAPIError } from "@/lib/api-client";

export default function AddQuestionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createQuestionMutation = useCreateQuestion();
  
  const {
    isAnalyzing,
    suggestions,
    error: aiError,
    triggerAIAnalysis,
    clearAISuggestions,
    applyAITag,
    resetForm,
  } = useQuestionFormStore();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      console.log("Creating question:", data);

      // Extract the HTML content from Tiptap editor
      const contentText = data.contentHtml || data.content;
      
      if (!data.title || !contentText) {
        alert("Please provide both title and content");
        setIsSubmitting(false);
        return;
      }

      // Call the API to create question
      const newQuestion = await createQuestionMutation.mutateAsync({
        title: data.title,
        content: contentText,
        tags: data.tags || [],
      });

      console.log("Question created successfully!", newQuestion);
      
      // Reset form after successful submission
      resetForm();

      // Small delay to ensure cache invalidation completes
      await new Promise(resolve => setTimeout(resolve, 300));

      // Redirect back to questions
      router.push("/");
    } catch (error) {
      console.error("Error creating question:", error);
      alert(`Failed to create question: ${handleAPIError(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshAI = async () => {
    await triggerAIAnalysis();
  };

  const handleApplyTag = (tagName: string) => {
    applyAITag(tagName);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={() => {}} isSidebarOpen={false} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <Link
                href="/questions"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Questions
              </Link>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Ask question
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Required fields</span>
                  <span className="text-red-500">*</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <QuestionForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitButtonText="Post Your Question"
              className="space-y-6"
              aiSuggestedTags={suggestions?.tags || []}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* Partnered with Google Gemini */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">Partnered with</span>
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900">
                    Google Gemini
                  </span>
                </div>

                <AIAssistantPanel
                  isAnalyzing={isAnalyzing}
                  suggestions={suggestions}
                  error={aiError}
                  onRefresh={handleRefreshAI}
                  onApplyTag={handleApplyTag}
                />

                <div className="space-y-4 text-sm text-gray-600 mt-4">
                  <p>
                    Get tips by adding a title, detailing your problem, and your
                    expected results. Suggestions to improve your question will
                    appear here.
                  </p>

                  <div className="italic text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    Please review your question carefully. Feedback is
                    experimental and may not cover all aspects of a well written
                    question.
                  </div>
                </div>
              </div>

              {/* Additional Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Writing a good question
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Be specific about your problem</li>
                  <li>• Include relevant code examples</li>
                  <li>• Describe what you expected vs. what happened</li>
                  <li>• Use appropriate tags</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}