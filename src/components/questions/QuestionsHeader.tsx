"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface QuestionsHeaderProps {
  title?: string;
  subtitle?: string;
  showButton?: boolean;
}

export default function QuestionsHeader({
  title = "Newest Questions",
  subtitle = "24,204,512 questions",
  showButton = true,
}: QuestionsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">{subtitle}</p>
        </div>
      </div>
      {showButton && (
        <Link href="/questions/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-4 sm:px-6 self-start sm:self-auto cursor-pointer">
            Ask Question
          </Button>
        </Link>
      )}
    </div>
  );
}

// Export a specific header for posts/questions feed like PostsHeader
export function PostsQuestionsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-4 sm:gap-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Interesting questions for you
        </h2>
        <div className="text-xs sm:text-sm text-gray-500">
          Based on your viewing history and watched tags.{" "}
          <Link href="#" className="text-blue-600 hover:text-blue-800">
            Customize your feed
          </Link>
        </div>
      </div>
      <Link href="/questions/add">
        <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-4 sm:px-6">
          Ask Question
        </Button>
      </Link>
    </div>
  );
}
