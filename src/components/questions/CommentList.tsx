"use client";

import { useState } from "react";
import type { Comment } from "@/types/questions";

interface CommentListProps {
  comments: Comment[];
  maxVisible?: number;
}

const CommentList = ({ comments, maxVisible = 5 }: CommentListProps) => {
  const [showAll, setShowAll] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState("");

  const visibleComments = showAll ? comments : comments.slice(0, maxVisible);
  const hiddenCount = comments.length - maxVisible;

  const handleAddComment = () => {
    if (newComment.trim().length >= 15) {
      // API call would go here
      console.log("Adding comment:", newComment);
      setNewComment("");
      setShowAddComment(false);
    }
  };

  const handleCancel = () => {
    setShowAddComment(false);
    setNewComment("");
  };

  if (comments.length === 0) {
    return (
      <button 
        onClick={() => setShowAddComment(!showAddComment)}
        className="text-blue-600 hover:text-blue-800 text-sm"
      >
        Add a comment
      </button>
    );
  }

  return (
    <>
      {/* Comments List */}
      <div className="border-t border-gray-200 pt-2 space-y-2">
        {visibleComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}

        {/* Show More/Less Comments */}
        {!showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium pt-1"
          >
            Show {hiddenCount} more comment{hiddenCount > 1 ? 's' : ''}
          </button>
        )}

        {showAll && comments.length > maxVisible && (
          <button
            onClick={() => setShowAll(false)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium pt-1"
          >
            Show less
          </button>
        )}

        {/* Add Comment Button */}
        <div className="pt-2 border-t border-gray-100">
          {!showAddComment ? (
            <button 
              onClick={() => setShowAddComment(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Add a comment
            </button>
          ) : (
            <AddCommentForm
              newComment={newComment}
              setNewComment={setNewComment}
              onSubmit={handleAddComment}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </>
  );
};

// Comment item component
const CommentItem = ({ comment }: { comment: Comment }) => (
  <div className="flex items-start gap-2 py-1">
    <div className="flex-1 min-w-0">
      <div className="text-sm text-gray-800 leading-relaxed">
        <CommentContent content={comment.content} />
        {' – '}
        <span className="text-blue-600 hover:text-blue-800 text-xs cursor-pointer">
          {comment.author.name}
        </span>
        <span className="text-gray-500 text-xs ml-1">
          {comment.author.reputation.toLocaleString()}
        </span>
        <span className="text-gray-500 text-xs ml-2">
          {comment.timeAgo}
        </span>
      </div>
    </div>
    {comment.votes !== undefined && comment.votes > 0 && (
      <div className="text-xs text-gray-500">
        {comment.votes}
      </div>
    )}
  </div>
);

// Add comment form component
const AddCommentForm = ({
  newComment,
  setNewComment,
  onSubmit,
  onCancel
}: {
  newComment: string;
  setNewComment: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) => (
  <div className="space-y-2">
    <div className="bg-blue-50 border border-blue-200 rounded p-2">
      <p className="text-xs text-gray-600 mb-1">
        Use comments to ask for more information or suggest improvements.
      </p>
      <p className="text-xs text-gray-500">
        Mini-Markdown: <code className="bg-blue-100 px-1 rounded">`code`</code>, <em>*italic*</em>, <strong>**bold**</strong>
      </p>
    </div>
    
    <textarea
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Use comments to ask for clarification..."
      className="w-full border border-gray-300 rounded p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      rows={2}
    />
    
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">
        Enter at least 15 characters
      </p>
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={newComment.trim().length < 15}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm"
        >
          Add comment
        </button>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 px-3 py-1 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// Comment content parser component
const CommentContent = ({ content }: { content: string }) => {
  const parts = content.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={index} className="bg-gray-100 px-1 rounded text-xs">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.includes('](')) {
          const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
          if (linkMatch) {
            return (
              <a 
                key={index} 
                href={linkMatch[2]} 
                className="text-blue-600 hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkMatch[1]}
              </a>
            );
          }
        }
        return part;
      })}
    </>
  );
};

export default CommentList;
