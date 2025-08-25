import { Metadata } from "next";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionsContainer } from "@/components/shared";
import { mockQuestions } from "@/constants/questions";

export const metadata: Metadata = {
  title: "Questions - DevColl",
  description: "Browse the latest questions from the developer community",
};

export default function QuestionsPage() {
  return (
    <AppLayout>
      <QuestionsContainer 
        questions={mockQuestions}
        showHeader={true}
        showFilters={true}
        showWelcome={false}
        showSuggestedDevelopers={false}
      />
    </AppLayout>
  );
}
