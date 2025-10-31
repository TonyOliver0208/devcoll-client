"use client";

import { useEffect } from "react";
import WelcomeSection from "@/components/home/WelcomeSection";
import SuggestedDevelopers from "@/components/home/SuggestedDeveloper";
import RightSidebar from "@/components/home/RightSidebar";
import QuestionsFeed from "@/components/questions/QuestionsFeed";
import QuestionsFilters from "@/components/questions/QuestionsFilters";
import QuestionsHeader, { PostsQuestionsHeader } from "@/components/questions/QuestionsHeader";
import TagQuestionsHeader from "@/components/questions/TagQuestionsHeader";
import { QuestionFeedProps } from "@/types/questions";
import type { Question } from "@/types/questions";
import { useQuestions } from "@/hooks/use-questions";
import { useQuestionsStore } from "@/store";

interface QuestionsContainerProps {
  showHeader?: boolean;
  showFilters?: boolean;
  showWelcome?: boolean;
  showSuggestedDevelopers?: boolean;
  showPostsHeader?: boolean;
  username?: string;
  tagName?: string;
  isTagPage?: boolean;
  // Legacy prop for backward compatibility - will be phased out
  questions?: any[];
}

export default function QuestionsContainer({
  showHeader = true,
  showFilters = true,
  showWelcome = false,
  showSuggestedDevelopers = false,
  showPostsHeader = false,
  username = "User",
  tagName,
  isTagPage = false,
  questions: legacyQuestions,
}: QuestionsContainerProps) {
  // Only use React Query if no legacy questions are provided
  // Check for undefined explicitly to properly detect when mock data is disabled
  const shouldUseQuery = legacyQuestions === undefined;
  
  const { 
    data: queryQuestions, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuestions(undefined, { enabled: shouldUseQuery });

  const {
    currentFilter,
    setFilter,
  } = useQuestionsStore();

  // Priority: legacy questions > React Query data > empty array
  const questions: Question[] = legacyQuestions || (queryQuestions as Question[]) || [];
  const loading = shouldUseQuery ? isLoading : false;
  const errorState = shouldUseQuery && isError ? (error?.message || 'Failed to load questions') : null;

  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    // Note: Filter changes would trigger React Query refetch via query key changes
  };

  // Use legacy questions if provided, otherwise use React Query data
  const displayQuestions = questions;

  return (
    <main className="flex-1 lg:ml-0">
      <div className="py-3 sm:py-6">
        {/* Welcome Section - Only for home page */}
        {showWelcome && <WelcomeSection username={username} />}

        <div className="px-2 sm:px-4">
          {/* Suggested Developers - Only for home page */}
          {showSuggestedDevelopers && <SuggestedDevelopers />}

          {/* Posts Questions Header - For home page to match PostsHeader */}
          {showPostsHeader && <PostsQuestionsHeader />}

          {/* Tag Questions Header - For individual tag pages */}
          {isTagPage && tagName && (
            <TagQuestionsHeader 
              tagName={tagName} 
              questionCount={questions.length}
            />
          )}

          {/* Questions Header - For questions page */}
          {showHeader && !showPostsHeader && !isTagPage && <QuestionsHeader />}

          {/* Questions Filters - Reuse existing component */}
          {showFilters && (
            <QuestionsFilters
              activeFilter={currentFilter}
              onFilterChange={handleFilterChange}
            />
          )}

          {/* Questions Feed and Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mt-4 sm:mt-6">
            <div className="lg:col-span-2 xl:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading questions...</p>
                  </div>
                </div>
              ) : errorState ? (
                <div className="flex justify-center items-center py-20">
                  <div className="max-w-md w-full text-center">
                    <div className="mb-6">
                      <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      
                                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Oops! We're having trouble loading questions
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      Don't worry, this happens sometimes. Try refreshing and we'll get you back to browsing awesome questions!
                    </p>
                    </div>
                    
                    <button
                      onClick={() => refetch()}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <QuestionsFeed questions={questions} />
              )}
            </div>
            <aside className="lg:col-span-1 xl:col-span-1 order-first lg:order-last">
              <div className="lg:sticky lg:top-[120px]">
                <RightSidebar />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
