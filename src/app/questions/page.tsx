'use client'

import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionsContainer } from "@/components/shared";
import { useQuestions } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Wifi } from "lucide-react";
import { getErrorMessage, isNetworkError } from "@/lib/errors";

// Note: Since this is now a client component, metadata should be handled at layout level
// export const metadata: Metadata = {
//   title: "Questions - DevColl", 
//   description: "Browse the latest questions from the developer community",
// };

export default function QuestionsPage() {
  const { data: questions, isLoading, error, refetch, isRefetching } = useQuestions()

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    const isOffline = isNetworkError(error)
    
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="max-w-md text-center">
            {isOffline ? (
              <Wifi className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            ) : (
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            )}
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isOffline ? 'Connection Problem' : 'Failed to Load Questions'}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {getErrorMessage(error)}
            </p>
            
            <Button 
              onClick={() => refetch()} 
              disabled={isRefetching}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? 'Loading...' : 'Try Again'}
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <QuestionsContainer 
        questions={Array.isArray(questions) ? questions : []}
        showHeader={true}
        showFilters={true}
        showWelcome={false}
        showSuggestedDevelopers={false}
      />
    </AppLayout>
  );
}
