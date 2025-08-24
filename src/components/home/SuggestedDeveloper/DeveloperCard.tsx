"use client";

import Link from "next/link";
import { Star, Code, MessageCircle } from "lucide-react";
import { Developer } from "@/types";

export default function DeveloperCard({ developer }: { developer: Developer }) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded hover:shadow-sm transition-shadow h-full">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar circle with initials */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {developer.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/users/${developer.username}`}
            className="font-semibold text-blue-600 hover:text-blue-700 block truncate"
          >
            {developer.name}
          </Link>
          <p className="text-sm text-gray-600 truncate">{developer.title}</p>
          {developer.location && (
            <p className="text-xs text-gray-500 truncate">
              {developer.location}
            </p>
          )}
        </div>
      </div>

      {/* Reputation + badges */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm mb-1">
          <Star size={14} className="text-orange-500" />
          <span className="font-semibold text-gray-700">
            {developer.reputation.toLocaleString()}
          </span>
          <span className="text-gray-500">reputation</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span>{developer.badges.gold}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span>{developer.badges.silver}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span>{developer.badges.bronze}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1 mb-2">
          {developer.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Q&A Stats */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <MessageCircle size={12} />
          <span>{developer.answersCount} answers</span>
        </div>
        <div className="flex items-center gap-1">
          <Code size={12} />
          <span>{developer.questionsCount} questions</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors">
          Follow
        </button>
        <Link
          href={`/users/${developer.username}`}
          className="flex-1 border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors text-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
