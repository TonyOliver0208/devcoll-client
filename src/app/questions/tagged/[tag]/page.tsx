"use client";

import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionsContainer } from "@/components/shared";
import { mockQuestions } from "@/constants/questions";
import { USE_MOCK_DATA } from "@/config/data-source";
import { useQuestions } from "@/hooks/use-questions";

export default function TagQuestionsPage() {
  const params = useParams();
  const tagId = params.tag as string;
  
  // Decode the tag name from URL (in case it contains special characters)
  const tagName = decodeURIComponent(tagId);

  // Use mock data or API based on configuration
  if (USE_MOCK_DATA) {
    // Filter mock questions by tag
    const taggedQuestions = mockQuestions.filter(question => 
      question.tags?.some(tag => 
        tag.toLowerCase() === tagName.toLowerCase()
      )
    );

    return (
      <AppLayout>
        <QuestionsContainer 
          questions={taggedQuestions}
          showHeader={true}
          showFilters={true}
          showWelcome={false}
          showSuggestedDevelopers={false}
          showPostsHeader={false}
          tagName={tagName}
          isTagPage={true}
        />
      </AppLayout>
    );
  }

  // API mode: Use React Query with tag filter
  // Note: Backend doesn't support tags yet, so this will show all questions
  // TODO: Update when backend adds tag filtering support
  return (
    <AppLayout>
      <QuestionsContainer 
        questions={undefined} // Will use React Query
        showHeader={true}
        showFilters={true}
        showWelcome={false}
        showSuggestedDevelopers={false}
        showPostsHeader={false}
        tagName={tagName}
        isTagPage={true}
      />
    </AppLayout>
  );
}
