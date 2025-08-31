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
  const {
    questions,
    loading,
    error,
    currentFilter,
    setFilter,
    fetchQuestions,
  } = useQuestionsStore();

  // Initialize with legacy questions if provided, otherwise fetch from store
  useEffect(() => {
    if (legacyQuestions && legacyQuestions.length > 0) {
      // If legacy questions are provided, use them (backward compatibility)
      // This maintains existing functionality while transitioning to store
      return;
    }
    
    // Fetch questions based on context
    if (isTagPage && tagName) {
      // For tag pages, we could filter by tag in the future
      fetchQuestions(currentFilter);
    } else {
      fetchQuestions(currentFilter);
    }
  }, [isTagPage, tagName, currentFilter, fetchQuestions, legacyQuestions]);

  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    fetchQuestions(filter);
  };

  // Use legacy questions if provided, otherwise use store questions
  const displayQuestions = legacyQuestions || questions;

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
              questionCount={displayQuestions.length}
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
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading questions...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Error: {error}</p>
                  <button 
                    onClick={() => fetchQuestions(currentFilter)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <QuestionsFeed questions={displayQuestions} />
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
