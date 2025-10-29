"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Question } from "@/types/questions";
import RightSidebar from "@/components/home/RightSidebar";
import QuestionSection from "./QuestionSection";
import AnswerSection from "./AnswerSection";
import YourAnswer from "./YourAnswer";
import { handleHashNavigation } from "@/lib/scrollUtils";

interface QuestionDetailProps {
  question: Question;
  currentUserId?: string;
}

const QuestionDetail = ({ question, currentUserId }: QuestionDetailProps) => {
  const router = useRouter();
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Handle hash navigation on component mount
  useEffect(() => {
    handleHashNavigation();
  }, []);

  // Question interaction handlers
  const handleQuestionVote = async (type: 'up' | 'down') => {
    try {
      console.log(`Voting ${type} on question ${question.id}`);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleQuestionShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: question.title, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleQuestionEdit = () => {
    router.push(`/questions/${question.id}/edit`);
  };

  const handleQuestionFlag = () => {
    console.log('Flag question');
  };

  // Answer interaction handlers
  const handleAnswerVote = async (answerId: number, type: 'up' | 'down') => {
    try {
      console.log(`Voting ${type} on answer ${answerId}`);
    } catch (error) {
      console.error('Failed to vote on answer:', error);
    }
  };

  const handleAnswerAccept = async (answerId: number) => {
    try {
      console.log(`Accepting answer ${answerId}`);
    } catch (error) {
      console.error('Failed to accept answer:', error);
    }
  };

  const handleAnswerShare = (answerId: number) => {
    const url = `${window.location.href}#answer-${answerId}`;
    if (navigator.share) {
      navigator.share({ url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleAnswerEdit = (answerId: number) => {
    router.push(`/questions/${question.id}/answers/${answerId}/edit`);
  };

  const handleAnswerFlag = (answerId: number) => {
    console.log(`Flag answer ${answerId}`);
  };

  // Submit new answer
  const handleSubmitAnswer = async (content: string) => {
    setIsSubmittingAnswer(true);
    try {
      console.log('Submitting answer:', content);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw error;
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const canAcceptAnswers = currentUserId === question.author.id;

  return (
    <main className="flex-1 lg:ml-0">
      <div className="py-3 sm:py-6">
        <div className="px-2 sm:px-4">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Link 
              href="/questions" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Questions
            </Link>
          </div>

          {/* Question Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-normal text-gray-900 mb-2 leading-tight">
              {question.title}
            </h1>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 mb-4">
              <div>Asked <span className="font-medium">{question.timeAgo}</span></div>
              <div>Modified <span className="font-medium">today</span></div>
              <div>Viewed <span className="font-medium">{question.views.toLocaleString()} times</span></div>
            </div>
            
            {/* Question Tags */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
              {question.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/questions/tagged/${tag}`}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {/* Question & Answers Content */}
            <div className="lg:col-span-2 xl:col-span-3">
              {/* Question */}
              <QuestionSection
                question={question}
                onVote={handleQuestionVote}
                onShare={handleQuestionShare}
                onEdit={handleQuestionEdit}
                onFlag={handleQuestionFlag}
                currentUserId={currentUserId}
              />

              {/* Answers */}
              {question.answers_data && question.answers_data.length > 0 && (
                <AnswerSection
                  answers={question.answers_data}
                  totalAnswers={question.answers}
                  onVote={handleAnswerVote}
                  onAccept={handleAnswerAccept}
                  onShare={handleAnswerShare}
                  onEdit={handleAnswerEdit}
                  onFlag={handleAnswerFlag}
                  currentUserId={currentUserId}
                  canAcceptAnswers={canAcceptAnswers}
                />
              )}

              {/* Your Answer */}
              <YourAnswer
                questionId={question.id.toString()}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmittingAnswer}
              />
            </div>

            {/* Right Sidebar */}
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
};

export default QuestionDetail;
