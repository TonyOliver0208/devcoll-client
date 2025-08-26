"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { Question } from "@/types/questions";

interface QuestionsFeedProps {
  questions: Question[];
}

export default function QuestionsFeed({ questions }: QuestionsFeedProps) {
  return (
    <div className="bg-white">
      <QuestionsList questions={questions} />
    </div>
  );
}

function QuestionsList({ questions }: { questions: Question[] }) {
  return (
    <div className="border border-gray-250 rounded">
      {questions.map((question, index) => (
        <QuestionItem
          key={question.id}
          question={question}
          showBorder={index < questions.length - 1}
        />
      ))}
    </div>
  );
}

function QuestionItem({
  question,
  showBorder,
}: {
  question: Question;
  showBorder: boolean;
}) {
  return (
    <div
      className={`px-2 sm:px-4 py-3 sm:py-4 ${
        showBorder ? "border-b border-gray-250" : ""
      } hover:bg-gray-50 transition-colors`}
    >
      <div className="flex gap-3 sm:gap-6">
        <QuestionStats question={question} />
        <QuestionContent question={question} />
      </div>
    </div>
  );
}

function QuestionStats({ question }: { question: Question }) {
  return (
    <div className="flex flex-col items-end gap-1 text-xs sm:text-sm text-gray-600 min-w-[60px] sm:min-w-[80px]">
      <div className="flex items-center">
        <span className="mr-1">{question.votes}</span>
        <span className="hidden sm:inline">votes</span>
        <span className="sm:hidden">v</span>
      </div>
      <div
        className={`flex items-center ${
          question.hasAcceptedAnswer
            ? "text-green-600"
            : question.answers > 0
            ? "text-green-600"
            : ""
        }`}
      >
        <span className="mr-1">{question.answers}</span>
        <span className="hidden sm:inline">answers</span>
        <span className="sm:hidden">a</span>
      </div>
      <div className="flex items-center text-gray-500">
        <span className="mr-1">
          {question.views > 1000
            ? `${Math.floor(question.views / 1000)}k`
            : question.views}
        </span>
        <span className="hidden sm:inline">views</span>
        <span className="sm:hidden">v</span>
      </div>
    </div>
  );
}

function QuestionContent({ question }: { question: Question }) {
  return (
    <div className="flex-1">
      {/* Bounty Badge */}
      {question.bountyAmount && (
        <div className="mb-2">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            <Award size={12} className="mr-1" />+{question.bountyAmount}
          </div>
        </div>
      )}

      {/* Title */}
      <Link
        href={`/questions/${question.id}`}
        className="text-blue-600 hover:text-blue-800 font-normal text-sm sm:text-base mb-2 block leading-tight line-clamp-2 sm:line-clamp-3"
      >
        {question.title}
      </Link>

      {/* Excerpt */}
      {question.excerpt && (
        <p className="text-gray-700 text-xs sm:text-sm mb-2 line-clamp-2">
          {question.excerpt}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {question.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded text-xs truncate max-w-[80px] sm:max-w-none"
          >
            {tag}
          </span>
        ))}
        {question.tags.length > 3 && (
          <span className="text-xs text-gray-500">
            +{question.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Author Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center min-w-0 flex-1">
          <img
            src="/api/placeholder/16/16"
            alt={question.author.name}
            className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 flex-shrink-0"
          />
          <span className="text-blue-600 truncate mr-1">{question.author.name}</span>
          <span className="ml-1 text-gray-600 hidden sm:inline">
            {question.author.reputation.toLocaleString()}
          </span>
          <span className="ml-1 sm:ml-2 flex-shrink-0">asked {question.timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
