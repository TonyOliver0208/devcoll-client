"use client";

import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionsContainer } from "@/components/shared";
import { mockQuestions } from "@/constants/questions";
import { USE_MOCK_DATA } from "@/config/data-source";

export default function HomePage() {
  const { data: session } = useSession();
  const username = session?.user?.name || "Phước Long Nguyễn";

  return (
    <AppLayout>
      <QuestionsContainer 
        questions={USE_MOCK_DATA ? mockQuestions : undefined}
        username={username}
        showHeader={false}
        showFilters={false}
        showWelcome={true}
        showSuggestedDevelopers={true}
        showPostsHeader={true}
      />
    </AppLayout>
  );
}
