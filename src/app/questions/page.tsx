import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionsContainer } from "@/components/shared";
import { mockQuestions } from "@/constants/questions";
import { USE_MOCK_DATA } from "@/config/data-source";

export const metadata: Metadata = {
  title: "Questions - DevColl",
  description: "Browse the latest questions from the developer community",
};

export default function QuestionsPage() {
  return (
    <AppLayout>
      <QuestionsContainer
        // Pass mock questions only if USE_MOCK_DATA is true
        // If false, QuestionsContainer will use React Query
        questions={USE_MOCK_DATA ? mockQuestions : undefined}
        showHeader={true}
        showFilters={true}
        showWelcome={false}
        showSuggestedDevelopers={false}
      />
    </AppLayout>
  );
}
