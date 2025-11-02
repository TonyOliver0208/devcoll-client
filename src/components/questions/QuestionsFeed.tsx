"use client";

import Link from "next/link";
import { Award, CheckCircle } from "lucide-react";
import { Question } from "@/types/questions";

interface QuestionsFeedProps {
  questions: Question[];
}

export default function QuestionsFeed({ questions }: QuestionsFeedProps) {
  if (questions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No questions found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <QuestionsList questions={questions} />
    </div>
  );
}

function QuestionsList({ questions }: { questions: Question[] }) {
  return (
    <div className="divide-y divide-gray-200 border-t border-gray-200">
      {questions.map((question) => (
        <QuestionItem key={question.id} question={question} />
      ))}
    </div>
  );
}

function QuestionItem({ question }: { question: Question }) {
  return (
    <div className="flex gap-4 px-4 py-4 hover:bg-gray-50 transition-colors">
      {/* Left Stats Section */}
      <QuestionStats question={question} />
      
      {/* Right Content Section */}
      <QuestionContent question={question} />
    </div>
  );
}

function QuestionStats({ question }: { question: Question }) {
  return (
    <div className="flex flex-col gap-2 items-end text-sm text-gray-600 min-w-[100px] flex-shrink-0">
      {/* Votes */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-gray-900">{question.votes}</span>
        <span className="text-gray-600">vote{question.votes !== 1 ? 's' : ''}</span>
      </div>
      
      {/* Answers */}
      <div
        className={`flex items-center gap-1.5 ${
          question.hasAcceptedAnswer
            ? "text-green-700 bg-green-100 px-2 py-0.5 rounded"
            : question.answers > 0
            ? "text-green-700"
            : "text-gray-600"
        }`}
      >
        {question.hasAcceptedAnswer && (
          <CheckCircle size={14} className="text-green-700" />
        )}
        <span className="font-medium text-gray-900">{question.answers}</span>
        <span>answer{question.answers !== 1 ? 's' : ''}</span>
      </div>
      
      {/* Views */}
      <div className="flex items-center gap-1.5 text-gray-500">
        <span>
          {question.views >= 1000
            ? `${(question.views / 1000).toFixed(1)}k`
            : question.views}
        </span>
        <span>view{question.views !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

function QuestionContent({ question }: { question: Question }) {
  return (
    <div className="flex-1 min-w-0">
      {/* Bounty Badge */}
      {question.bountyAmount && (
        <div className="mb-2">
          <div className="inline-flex items-center bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium gap-1">
            <Award size={12} />
            <span>+{question.bountyAmount}</span>
          </div>
        </div>
      )}

      {/* Title - Stack Overflow style */}
      <h3 className="mb-2">
        <Link
          href={`/questions/${question.id}`}
          className="text-blue-600 hover:text-blue-800 text-[17px] leading-snug font-normal"
        >
          {question.title}
        </Link>
      </h3>

      {/* Excerpt */}
      {question.excerpt && (
        <p className="text-gray-700 text-[13px] mb-2 line-clamp-2 leading-relaxed">
          {question.excerpt}
        </p>
      )}

      {/* Bottom row: Tags + Author Info */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {question.tags.map((tag) => (
            <Link
              key={tag}
              href={`/questions/tagged/${tag}`}
              className="inline-flex items-center px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs rounded transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
          <img
            src={question.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author.name)}&size=20&background=random`}
            alt={question.author.name}
            className="w-5 h-5 rounded"
          />
          <Link
            href={`/users/${question.author.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {question.author.name}
          </Link>
          <span className="text-gray-700 font-semibold">
            {question.author.reputation.toLocaleString()}
          </span>
          <span className="text-gray-500">
            asked {question.timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
}
