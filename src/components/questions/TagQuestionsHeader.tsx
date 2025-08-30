"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

interface TagQuestionsHeaderProps {
  tagName: string;
  questionCount?: number;
}

export default function TagQuestionsHeader({
  tagName,
  questionCount,
}: TagQuestionsHeaderProps) {
  const formatTagName = (tag: string) => {
    return `[${tag}]`;
  };

  return (
    <div className="mb-4 sm:mb-6">
      {/* Tag Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatTagName(tagName)}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-sm px-4 py-2 border-gray-300 hover:bg-gray-50"
          >
            Watching
          </Button>
          <Link href="/questions/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2">
              Ask Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Tag Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          JavaScript (a dialect of ECMAScript) is a high-level, multi-paradigm,
          object-oriented, prototype-based, dynamically-typed, and interpreted
          language traditionally used for client-side scripting in web browsers.
        </p>
      </div>

      {/* Question Count */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {questionCount
            ? `${questionCount.toLocaleString()} questions`
            : "Questions"}
        </h2>
        <Link
          href="/wiki"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Go to Wiki
        </Link>
      </div>
    </div>
  );
}
