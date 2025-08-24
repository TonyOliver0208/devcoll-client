import Link from "next/link";
import { Post } from "@/types/homepage";

interface PostsFeedProps {
  posts: Post[];
}

export default function PostsFeed({ posts }: PostsFeedProps) {
  return (
    <div className="bg-white">
      <PostsList posts={posts} />
    </div>
  );
}

export function PostsHeader() {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-gray-800">
        Interesting posts for you
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

function PostsList({ posts }: { posts: Post[] }) {
  return (
    <div className="border border-gray-250 rounded">
      {posts.map((post, index) => (
        <PostItem
          key={post.id}
          post={post}
          showBorder={index < posts.length - 1}
        />
      ))}
    </div>
  );
}

function PostItem({ post, showBorder }: { post: Post; showBorder: boolean }) {
  return (
    <div
      className={`px-4 py-4 ${
        showBorder ? "border-b border-gray-250" : ""
      } hover:bg-gray-50 transition-colors`}
    >
      <div className="flex gap-6">
        <PostStats post={post} />
        <PostContent post={post} />
      </div>
    </div>
  );
}

function PostStats({ post }: { post: Post }) {
  return (
    <div className="flex flex-col items-end gap-1 text-sm text-gray-600 min-w-[80px]">
      <div className="flex items-center">
        <span className="mr-1">{post.votes}</span>
        <span>votes</span>
      </div>
      <div
        className={`flex items-center ${
          post.answers > 0 ? "text-green-600" : ""
        }`}
      >
        <span className="mr-1">{post.answers}</span>
        <span>answers</span>
      </div>
      <div className="flex items-center text-gray-500">
        <span className="mr-1">
          {post.views > 1000 ? `${Math.floor(post.views / 1000)}k` : post.views}
        </span>
        <span>views</span>
      </div>
    </div>
  );
}

function PostContent({ post }: { post: Post }) {
  return (
    <div className="flex-1">
      <Link
        href={`/questions/${post.id}`}
        className="text-blue-600 hover:text-blue-800 font-normal text-base mb-2 block"
      >
        {post.title}
      </Link>

      <div className="flex flex-wrap gap-1 mb-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <img
            src="/api/placeholder/16/16"
            alt={post.author}
            className="w-4 h-4 rounded mr-1"
          />
          <span className="text-blue-600">{post.author}</span>
          <span className="ml-1 text-gray-600">
            {post.reputation.toLocaleString()}
          </span>
          <span className="ml-2">
            {post.hasAcceptedAnswer ? "answered" : "asked"} {post.timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
}
