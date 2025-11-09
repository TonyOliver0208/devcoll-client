"use client";

import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionsContainer } from "@/components/shared";
import { mockQuestions } from "@/constants/questions";
import { USE_MOCK_DATA } from "@/config/data-source";
import { usePostsByTag } from "@/hooks/use-tags";

export default function TagQuestionsPage() {
  const params = useParams();
  const tagId = params.tag as string;
  
  // Decode the tag name from URL (in case it contains special characters)
  const tagName = decodeURIComponent(tagId);

  // Fetch posts by tag from API using the custom hook
  const { data: taggedPosts, isLoading, error } = usePostsByTag(tagName, { 
    page: 1, 
    limit: 50 
  });

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

  // API mode: Use real backend data
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading questions tagged with {tagName}...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-500">Error loading questions: {error.message}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <QuestionsContainer 
        questions={taggedPosts?.posts || []} // Use posts from API
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
