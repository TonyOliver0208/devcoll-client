"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Question } from "@/types/questions";
import RightSidebar from "@/components/home/RightSidebar";
import CommentList from "./CommentList";

interface QuestionDetailProps {
  question: Question;
}

const QuestionDetail = ({ question }: QuestionDetailProps) => {
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
              <div>Viewed <span className="font-medium">{question.views} times</span></div>
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
              <QuestionSection question={question} />
              <AnswersSection question={question} />
              <YourAnswerSection />
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

// Question Section Component (simplified)
const QuestionSection = ({ question }: { question: Question }) => (
  <Card className="mb-6">
    <CardContent className="p-4 sm:p-6">
      <div className="flex gap-2 sm:gap-4">
        <VoteControls votes={question.votes} />
        <div className="flex-1 min-w-0">
          <ContentDisplay content={question.content || question.excerpt || ""} />
          <Separator className="my-4" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <ActionButtons />
            <AuthorCard author={question.author} timeAgo={question.timeAgo} action="asked" />
          </div>
          <div className="ml-12 sm:ml-16 mt-3">
            {question.comments && question.comments.length > 0 ? (
              <CommentList comments={question.comments} />
            ) : (
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 p-0 h-auto">
                Add a comment
              </Button>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Answers Section Component (simplified)
const AnswersSection = ({ question }: { question: Question }) => {
  if (!question.answers_data || question.answers_data.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 sm:mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-normal">
          {question.answers} Answer{question.answers !== 1 ? 's' : ''}
        </h2>
        <select className="text-sm border border-gray-300 rounded px-2 sm:px-3 py-1 bg-white">
          <option>Highest score (default)</option>
          <option>Trending (recent votes count more)</option>
          <option>Date modified (newest first)</option>
          <option>Date created (oldest first)</option>
        </select>
      </div>

      {question.answers_data.map((answer) => (
        <Card key={answer.id} className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex gap-2 sm:gap-4">
              <VoteControls votes={answer.votes} isAccepted={answer.isAccepted} />
              <div className="flex-1 min-w-0">
                <ContentDisplay content={answer.content} />
                <Separator className="my-4" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <ActionButtons />
                  <div className="text-xs text-gray-600">
                    answered {answer.timeAgo} by{' '}
                    <Link href={`/users/${answer.author.name.replace(/\s+/g, '-').toLowerCase()}`} className="text-blue-600 hover:text-blue-800">
                      {answer.author.name}
                    </Link>{' '}
                    <span className="text-gray-400">
                      ({answer.author.reputation > 1000 
                        ? `${Math.floor(answer.author.reputation / 1000)}k` 
                        : answer.author.reputation
                      })
                    </span>
                  </div>
                </div>
                <div className="ml-12 sm:ml-16 mt-3">
                  {answer.comments && answer.comments.length > 0 ? (
                    <CommentList comments={answer.comments} />
                  ) : (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 p-0 h-auto">
                      Add a comment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Your Answer Section (simplified)
const YourAnswerSection = () => (
  <Card className="mt-6 sm:mt-8">
    <CardContent className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-normal mb-3 sm:mb-4">Your Answer</h3>
      <div className="border border-gray-300 rounded">
        <div className="bg-gray-50 border-b border-gray-300 px-2 sm:px-3 py-2">
          <div className="flex gap-1 sm:gap-2">
            {['B', 'I', '{}', '🔗'].map((icon) => (
              <Button key={icon} variant="ghost" size="sm" className="px-2 py-1 h-auto">
                {icon}
              </Button>
            ))}
          </div>
        </div>
        <textarea 
          className="w-full h-32 sm:h-40 p-2 sm:p-3 resize-none focus:outline-none text-sm sm:text-base"
          placeholder="Write your answer here..."
        />
      </div>
      <div className="mt-3 sm:mt-4">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Post Your Answer
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Reusable Components
const VoteControls = ({ votes, isAccepted }: { votes: number; isAccepted?: boolean }) => (
  <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-[50px] sm:min-w-[60px]">
    <Button variant="ghost" size="icon" className="rounded-full">
      <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8" />
    </Button>
    <div className="text-xl sm:text-2xl font-bold text-gray-800">{votes}</div>
    <Button variant="ghost" size="icon" className="rounded-full">
      <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" />
    </Button>
    {isAccepted ? (
      <div className="text-green-600 text-xl font-bold">✓</div>
    ) : (
      <Button variant="ghost" size="icon" className="rounded-full mt-1 sm:mt-2">
        <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    )}
  </div>
);

const ContentDisplay = ({ content }: { content: string }) => (
  <div className="prose max-w-none mb-4 sm:mb-6">
    <div className="text-gray-800 leading-6 sm:leading-7 whitespace-pre-line text-sm sm:text-base">
      {content.split('```').map((part, index) => {
        if (index % 2 === 1) {
          return (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded p-2 sm:p-4 my-3 sm:my-4 font-mono text-xs sm:text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words sm:whitespace-pre">{part}</pre>
            </div>
          );
        }
        return (
          <div key={index} className="mb-3 sm:mb-4">
            {part.split('\n').map((line, lineIndex) => {
              if (line.includes('**')) {
                const parts = line.split('**');
                return (
                  <p key={lineIndex} className="mb-2">
                    {parts.map((textPart, partIndex) => 
                      partIndex % 2 === 1 ? 
                      <strong key={partIndex}>{textPart}</strong> : 
                      textPart
                    )}
                  </p>
                );
              }
              if (line.includes('`')) {
                const parts = line.split('`');
                return (
                  <p key={lineIndex} className="mb-2">
                    {parts.map((textPart, partIndex) => 
                      partIndex % 2 === 1 ? 
                      <code key={partIndex} className="bg-gray-100 px-1 py-0.5 rounded text-xs sm:text-sm break-words">{textPart}</code> : 
                      textPart
                    )}
                  </p>
                );
              }
              return line && <p key={lineIndex} className="mb-2">{line}</p>;
            })}
          </div>
        );
      })}
    </div>
  </div>
);

const ActionButtons = () => (
  <div className="flex gap-3 sm:gap-4 text-sm">
    {['Share', 'Edit', 'Follow'].map((action) => (
      <Button key={action} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 p-0 h-auto">
        {action}
      </Button>
    ))}
  </div>
);

const AuthorCard = ({ author, timeAgo, action }: { 
  author: { name: string; reputation: number }; 
  timeAgo: string; 
  action: string; 
}) => (
  <div className="bg-blue-50 p-2 sm:p-3 rounded self-start sm:self-auto">
    <div className="text-xs text-gray-600 mb-1">
      {action} {timeAgo}
    </div>
    <div className="flex items-center gap-2">
      <img
        src="/api/placeholder/32/32"
        alt={author.name}
        className="w-6 h-6 sm:w-8 sm:h-8 rounded"
      />
      <div>
        <Link 
          href={`/users/${author.name.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium break-words"
        >
          {author.name}
        </Link>
        <div className="text-xs text-gray-600">
          {author.reputation.toLocaleString()}
        </div>
      </div>
    </div>
  </div>
);

export default QuestionDetail;
