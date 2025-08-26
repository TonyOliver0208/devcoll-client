"use client";

import { useState } from "react";
import type { Comment } from "@/types/questions";
import { validateComment, previewMarkdown, submitComment } from "@/lib/commentUtils";

interface CommentListProps {
  comments: Comment[];
  maxVisible?: number;
}

const CommentList = ({ comments, maxVisible = 5 }: CommentListProps) => {
  const [showAll, setShowAll] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleComments = showAll ? comments : comments.slice(0, maxVisible);
  const hiddenCount = comments.length - maxVisible;

  const handleAddComment = async () => {
    const validation = validateComment(newComment);
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, just simulate API call
      const result = await submitComment(1, newComment, 'question'); // postId will come from props later
      
      if (result.success) {
        console.log("Comment submitted successfully:", result.processedContent);
        setNewComment("");
        setShowAddComment(false);
        // In real app, you'd refresh the comments list or add the new comment to state
      } else {
        console.error('Submit errors:', result.errors);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsSubmitting(false);
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
              isSubmitting={isSubmitting}
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
  onCancel,
  isSubmitting = false
}: {
  newComment: string;
  setNewComment: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const validation = validateComment(newComment);
  const { isValid, errors, warnings, characterCount } = validation;
  const isNearLimit = characterCount >= 10 && characterCount < 15;

  return (
    <div className="space-y-2">
      {/* Enhanced Information Box - matches StackOverflow style */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-700 mb-2">
              Use comments to ask for more information or suggest improvements. Avoid answering questions in comments.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Mini-Markdown:</span>
              <code className="bg-blue-100 px-1 py-0.5 rounded">`code`</code>
              <span className="text-gray-400">•</span>
              <em className="not-italic">_italic_</em>
              <span className="text-gray-400">•</span>
              <strong className="font-bold">**bold**</strong>
              <span className="text-gray-400">•</span>
              <span className="text-blue-600">[link](url)</span>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-blue-600 hover:text-blue-800 text-xs ml-2"
          >
            Help
          </button>
        </div>
        
        {/* Expanded help section */}
        {showHelp && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Comments are used to:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>Ask for clarification or more information</li>
                <li>Point out problems in the post</li>
                <li>Suggest improvements to the post</li>
              </ul>
              <p className="mt-2"><strong>Comments should NOT be used to:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>Answer the question (use the answer form instead)</li>
                <li>Leave "thank you" messages</li>
                <li>Have extended discussions</li>
              </ul>
              <p className="mt-2">
                <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                  Learn more about comments...
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Comment textarea with improved validation */}
      <div className="relative">
        {!showPreview ? (
          <>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Use comments to ask for clarification..."
              className={`w-full border rounded p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:border-blue-500 ${
                errors.length > 0
                  ? 'border-red-300 focus:ring-red-500' 
                  : isNearLimit && !isValid 
                    ? 'border-orange-300 focus:ring-orange-500' 
                    : isValid 
                      ? 'border-green-300 focus:ring-green-500' 
                      : 'border-gray-300 focus:ring-blue-500'
              }`}
              rows={2}
              maxLength={600} // StackOverflow comment limit
              disabled={isSubmitting}
            />
            
            {/* Character counter in textarea */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {600 - newComment.length}
            </div>
          </>
        ) : (
          /* Preview mode */
          <div className="w-full border border-gray-300 rounded p-2 text-sm min-h-[60px] bg-gray-50">
            <div className="text-xs text-gray-500 mb-1">Preview:</div>
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: previewMarkdown(newComment) }}
            />
          </div>
        )}
      </div>
      
      {/* Validation messages */}
      {errors.length > 0 && (
        <div className="text-xs text-red-600">
          {errors.map((error, index) => (
            <div key={index}>• {error}</div>
          ))}
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="text-xs text-orange-600">
          {warnings.map((warning, index) => (
            <div key={index}>⚠ {warning}</div>
          ))}
        </div>
      )}
      
      {/* Enhanced validation and action area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className={`text-xs ${
            errors.length > 0
              ? 'text-red-600'
              : isNearLimit && !isValid 
                ? 'text-orange-600' 
                : isValid 
                  ? 'text-green-600' 
                  : 'text-gray-500'
          }`}>
            {errors.length > 0 
              ? `${errors.length} error${errors.length > 1 ? 's' : ''} to fix`
              : isValid 
                ? `✓ Ready to post (${characterCount} characters)` 
                : `Enter at least ${15 - characterCount} more characters`
            }
          </p>
          
          {/* Preview toggle */}
          {newComment.trim().length > 0 && (
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-blue-600 hover:text-blue-800 ml-2"
              disabled={isSubmitting}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {isSubmitting ? 'Adding...' : 'Add comment'}
          </button>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 px-3 py-1 text-sm"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

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
