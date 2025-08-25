"use client";

import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionsContainer } from "@/components/shared";
import { mockQuestions } from "@/constants/questions";

export default function HomePage() {
  const { data: session } = useSession();
  const username = session?.user?.name || "Phước Long Nguyễn";

  return (
    <AppLayout>
      <QuestionsContainer 
        questions={mockQuestions}
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
