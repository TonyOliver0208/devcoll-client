"use client";

import { useState } from "react";
import WelcomeSection from "@/components/home/WelcomeSection";
import SuggestedDevelopers from "@/components/home/SuggestedDeveloper";
import RightSidebar from "@/components/home/RightSidebar";
import QuestionsFeed from "@/components/questions/QuestionsFeed";
import QuestionsFilters from "@/components/questions/QuestionsFilters";
import QuestionsHeader, { PostsQuestionsHeader } from "@/components/questions/QuestionsHeader";
import { QuestionFeedProps } from "@/types/questions";

interface QuestionsContainerProps extends QuestionFeedProps {
  username?: string;
  showPostsHeader?: boolean;
}

export default function QuestionsContainer({
  questions,
  showHeader = true,
  showFilters = true,
  showWelcome = false,
  showSuggestedDevelopers = false,
  showPostsHeader = false,
  username = "User",
}: QuestionsContainerProps) {
  const [activeFilter, setActiveFilter] = useState("newest");

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

          {/* Questions Header - For questions page */}
          {showHeader && !showPostsHeader && <QuestionsHeader />}

          {/* Questions Filters - Reuse existing component */}
          {showFilters && (
            <QuestionsFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          )}

          {/* Questions Feed and Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mt-4 sm:mt-6">
            <div className="lg:col-span-2 xl:col-span-3">
              <QuestionsFeed questions={questions} />
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
