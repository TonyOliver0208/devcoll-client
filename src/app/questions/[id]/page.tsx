"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionDetail } from "@/components/questions";
import { mockQuestions } from "@/constants/questions";
import { USE_MOCK_DATA } from "@/config/data-source";
import { useQuestion } from "@/hooks/use-questions";

interface QuestionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { id } = use(params);
  
  // Use mock data or API based on configuration
  const shouldUseAPI = !USE_MOCK_DATA;
  
  // Fetch from API if not using mock data
  // Note: useQuestion always runs, but we'll ignore it if using mock data
  const { data: apiQuestion, isLoading, isError } = useQuestion(shouldUseAPI ? id : "");
  
  // Get mock question for fallback
  const mockQuestion = mockQuestions.find(q => q.id === parseInt(id));
  
  // Determine which question to display
  const question = shouldUseAPI ? apiQuestion : mockQuestion;
  
  // Loading state
  if (shouldUseAPI && isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading question...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Error state
  if (shouldUseAPI && isError) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h0" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Question not found
              </h3>
              <p className="text-gray-600 leading-relaxed">
                This question may have been deleted or doesn't exist.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Not found state
  if (!question) {
    notFound();
  }

  return (
    <AppLayout>
      <QuestionDetail question={question} />
    </AppLayout>
  );
}
