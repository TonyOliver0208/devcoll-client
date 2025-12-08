"use client";

import { useEffect, useState } from "react";
import { tagsService } from "@/services/tags.service";
import type { Tag } from "@/types/tag";
import Link from "next/link";

interface HotPost {
  id: string;
  content: string;
  totalVotes: number;
}

const RightSidebar = () => {
  const [trendingTags, setTrendingTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [hotPosts, setHotPosts] = useState<HotPost[]>([]);
  const [isLoadingHotPosts, setIsLoadingHotPosts] = useState(true);

  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        setIsLoadingTags(true);
        const response = await tagsService.getPopularTags(5);
        setTrendingTags(response.tags || []);
      } catch (error) {
        console.error("Error fetching popular tags:", error);
        setTrendingTags([]);
      } finally {
        setIsLoadingTags(false);
      }
    };

    const fetchHotPosts = async () => {
      try {
        setIsLoadingHotPosts(true);
        const response = await tagsService.getHotPosts(5);
        setHotPosts(response.posts || []);
      } catch (error) {
        console.error("Error fetching hot posts:", error);
        setHotPosts([]);
      } finally {
        setIsLoadingHotPosts(false);
      }
    };

    fetchPopularTags();
    fetchHotPosts();
  }, []);

  const featuredMeta = [
    {
      title: "Upcoming initiatives on Stack Overflow",
      description: "and across the Stack Exchange network...",
    },
    {
      title: "Further Experimentation with Comment and Post Enhancements",
      description: "Meta Stack Overflow",
    },
  ];

  // Helper function to extract title from content
  const extractTitle = (content: string, maxLength: number = 80) => {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    // Truncate if too long
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div className=" space-y-2">
      {/* Trending Tags */}
      <div className="bg-white p-4 rounded-sm border border-gray-250">
        <h2 className="text-lg font-semibold mb-4">Trending Tags</h2>
        {isLoadingTags ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : trendingTags.length > 0 ? (
          <div className="space-y-2">
            {trendingTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${encodeURIComponent(tag.name)}`}
                className="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer"
              >
                <span className="text-blue-600">#{tag.name}</span>
                <span className="text-gray-500 text-sm">
                  {tag.questionsCount}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No trending tags yet</p>
        )}
      </div>

      {/* Featured Meta */}
      <div className="bg-white p-4 rounded-sm border border-gray-250">
        <h2 className="text-lg font-semibold mb-4">Featured on Meta</h2>
        <div className="space-y-4">
          {featuredMeta.map((item) => (
            <div key={item.title} className="space-y-1">
              <h3 className="font-medium text-blue-600 hover:text-blue-800">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Posts */}
      <div className="bg-white p-4 rounded-sm border border-gray-250">
        <h2 className="text-lg font-semibold mb-4">Hot Posts</h2>
        {isLoadingHotPosts ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-8"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hotPosts.length > 0 ? (
          <div className="space-y-4">
            {hotPosts.map((post) => (
              <Link
                key={post.id}
                href={`/questions/${post.id}`}
                className="flex items-start gap-3 group"
              >
                <div className="text-sm font-medium text-orange-500 min-w-[2rem]">
                  {post.totalVotes}
                </div>
                <h3 className="text-sm text-blue-600 group-hover:text-blue-800">
                  {extractTitle(post.content)}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hot posts yet</p>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
