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
      className={`px-4 py-4 ${
        showBorder ? "border-b border-gray-250" : ""
      } hover:bg-gray-50 transition-colors`}
    >
      <div className="flex gap-6">
        <QuestionStats question={question} />
        <QuestionContent question={question} />
      </div>
    </div>
  );
}

function QuestionStats({ question }: { question: Question }) {
  return (
    <div className="flex flex-col items-end gap-1 text-sm text-gray-600 min-w-[80px]">
      <div className="flex items-center">
        <span className="mr-1">{question.votes}</span>
        <span>votes</span>
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
        <span>answers</span>
      </div>
      <div className="flex items-center text-gray-500">
        <span className="mr-1">
          {question.views > 1000
            ? `${Math.floor(question.views / 1000)}k`
            : question.views}
        </span>
        <span>views</span>
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
        className="text-blue-600 hover:text-blue-800 font-normal text-base mb-2 block"
      >
        {question.title}
      </Link>

      {/* Excerpt */}
      {question.excerpt && (
        <p className="text-gray-700 text-sm mb-2 line-clamp-2">
          {question.excerpt}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Author Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <img
            src="/api/placeholder/16/16"
            alt={question.author.name}
            className="w-4 h-4 rounded mr-1"
          />
          <span className="text-blue-600">{question.author.name}</span>
          <span className="ml-1 text-gray-600">
            {question.author.reputation.toLocaleString()}
          </span>
          <span className="ml-2">asked {question.timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
