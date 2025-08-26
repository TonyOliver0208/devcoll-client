import { Metadata } from "next";
import { notFound } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { QuestionDetail } from "@/components/questions";
import { mockQuestions } from "@/constants/questions";

interface QuestionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: QuestionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const question = mockQuestions.find(q => q.id === parseInt(id));
  
  if (!question) {
    return {
      title: "Question not found - DevColl",
    };
  }

  return {
    title: `${question.title} - DevColl`,
    description: question.excerpt || `Question by ${question.author.name}`,
  };
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { id } = await params;
  const question = mockQuestions.find(q => q.id === parseInt(id));
  
  if (!question) {
    notFound();
  }

  return (
    <AppLayout>
      <QuestionDetail question={question} />
    </AppLayout>
  );
}
