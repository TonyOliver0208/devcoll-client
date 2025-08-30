"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import QuestionForm from "@/components/questions/QuestionForm";
import AIAssistantPanel from "@/components/questions/AIAssistantPanel";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { MockAIService, AISuggestion } from "@/services/mockAIService";

export default function AddQuestionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Assistant states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // TODO: Implement API call to create question
      console.log("Creating question:", data);

      // For now, just redirect back to questions
      router.push("/questions");
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Failed to create question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerAI = async (
    title: string, 
    description: string, 
    validationInfo?: {
      insufficient?: boolean;
      missingContent?: number;
      missingTitle?: number;
    }
  ) => {
    // Handle insufficient content case
    if (validationInfo?.insufficient) {
      setIsAnalyzing(false);
      setAiSuggestions(null);
      
      if ((validationInfo.missingContent || 0) > 0) {
        setAiError(`Please add an extra ${validationInfo.missingContent} characters to start getting tips`);
      } else if ((validationInfo.missingTitle || 0) > 0) {
        setAiError(`Please add an extra ${validationInfo.missingTitle} characters to your title`);
      }
      return;
    }

    if (!title.trim() || !description.trim()) return;

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const suggestions = await MockAIService.analyzeQuestion(title, description);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiError('Failed to analyze question. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefreshAI = () => {
    // Reset suggestions to allow re-analysis
    setAiSuggestions(null);
    setAiError(null);
  };

  const handleApplyTag = (tagName: string) => {
    // This will need to be connected to the form's addTag function
    console.log('Apply tag:', tagName);
    // TODO: Connect this to QuestionForm's tag addition functionality
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
              onTriggerAI={handleTriggerAI}
              aiSuggestedTags={aiSuggestions?.tags || []}
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
                  suggestions={aiSuggestions}
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