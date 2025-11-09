"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import QuestionForm from "@/components/questions/QuestionForm";
import AIAssistantPanel from "@/components/questions/AIAssistantPanel";
import { ConfirmDialog } from "@/components/shared";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useQuestionFormStore } from "@/store";
import { useCreateQuestion } from "@/hooks/use-questions";
import { handleAPIError } from "@/lib/api-client";

export default function AddQuestionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
      let contentText = data.contentHtml || data.content;
      
      if (!data.title || !contentText) {
        setErrorMessage("Please provide both title and content for your question.");
        setShowErrorDialog(true);
        setIsSubmitting(false);
        return;
      }

      // Handle pending images if any
      let mediaUrls: string[] = [];
      if (data.pendingImages && data.pendingImages.length > 0) {
        console.log(`Uploading ${data.pendingImages.length} images...`);
        
        try {
          // Import mediaApi and toast dynamically
          const { mediaApi } = await import("@/lib/api-client");
          const toast = (await import("react-hot-toast")).default;
          
          // Show uploading toast
          const toastId = toast.loading(`Uploading ${data.pendingImages.length} image(s)...`);
          
          // Upload all images
          const uploadResults = await mediaApi.uploadImages(
            data.pendingImages.map((img: any) => img.file)
          );
          
          // Dismiss loading toast and show success
          toast.success(`${data.pendingImages.length} image(s) uploaded successfully!`, {
            id: toastId
          });
          
          console.log("Images uploaded successfully:", uploadResults);
          
          // Replace placeholder links with actual image URLs in content
          uploadResults.forEach((result, index) => {
            const pendingImage = data.pendingImages[index];
            const placeholderPattern = new RegExp(
              `<a[^>]*href="#image:${pendingImage.id}"[^>]*>.*?</a>`,
              'g'
            );
            
            // Replace with actual image tag
            contentText = contentText.replace(
              placeholderPattern,
              `<img src="${result.url}" alt="${pendingImage.alt}" />`
            );
          });
          
          // Store media URLs for post metadata
          mediaUrls = uploadResults.map(r => r.url);
          
          console.log("Content updated with image URLs");
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          setErrorMessage(`Failed to upload images: ${handleAPIError(uploadError)}`);
          setShowErrorDialog(true);
          setIsSubmitting(false);
          return;
        }
      }

      // Call the API to create question with media URLs
      const newQuestion = await createQuestionMutation.mutateAsync({
        title: data.title,
        content: contentText,
        tags: data.tags || [],
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });

      console.log("Question created successfully!", newQuestion);
      
      // Reset form after successful submission
      resetForm();

      // Small delay to ensure cache invalidation completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to questions list to see the new question
      router.push("/questions");
    } catch (error) {
      console.error("Error creating question:", error);
      setErrorMessage(`Failed to create question: ${handleAPIError(error)}`);
      setShowErrorDialog(true);
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

      {/* Error Dialog */}
      <ConfirmDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        onConfirm={() => setShowErrorDialog(false)}
        title="Error"
        message={errorMessage}
        confirmText="OK"
        cancelText=""
        confirmButtonClass="bg-blue-600 hover:bg-blue-700 text-white"
      />
    </div>
  );
}