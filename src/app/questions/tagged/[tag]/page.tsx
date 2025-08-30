"use client";

import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionsContainer } from "@/components/shared";
import { mockQuestions } from "@/constants/questions";

export default function TagQuestionsPage() {
  const params = useParams();
  const tagId = params.tag as string;
  
  // Decode the tag name from URL (in case it contains special characters)
  const tagName = decodeURIComponent(tagId);

  // Filter questions by tag (in a real app, this would come from API)
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
