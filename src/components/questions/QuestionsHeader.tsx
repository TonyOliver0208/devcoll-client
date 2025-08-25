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
  showButton = true 
}: QuestionsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>
      </div>
      {showButton && (
        <Button className="bg-blue-600 hover:bg-blue-700">Ask Question</Button>
      )}
    </div>
  );
}

// Export a specific header for posts/questions feed like PostsHeader
export function PostsQuestionsHeader() {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-gray-800">
        Interesting questions for you
      </h2>
      <div className="text-sm text-gray-500">
        Based on your viewing history and watched tags.{" "}
        <Link href="#" className="text-blue-600 hover:text-blue-800">
          Customize your feed
        </Link>
      </div>
    </div>
  );
}
