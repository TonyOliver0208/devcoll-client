"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ContentDisplay from "./ContentDisplay";
import { VoteControls, ActionButtons, AuthorCard } from "./VoteControls";
import CommentList from "./CommentList";
import { generateAnchorId } from "@/lib/scrollUtils";
import type { Question } from "@/types/questions";

interface QuestionSectionProps {
  question: Question;
  onVote?: (type: 'up' | 'down') => void;
  onShare?: () => void;
  onEdit?: () => void;
  onFlag?: () => void;
  currentUserId?: string;
  voteLoading?: boolean;
  voteError?: string | null;
  onDismissError?: () => void;
}

const QuestionSection = ({ 
  question,
  onVote,
  onShare,
  onEdit,
  onFlag,
  currentUserId,
  voteLoading = false,
  voteError = null,
  onDismissError,
}: QuestionSectionProps) => {
  const canEdit = currentUserId === question.author.id;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleUpvote = () => {
    if (!voteLoading) onVote?.('up');
  };
  const handleDownvote = () => {
    if (!voteLoading) onVote?.('down');
  };

  return (
    <>
      {/* Error Popup */}
      {voteError && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-5">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Vote Failed</h3>
                <p className="text-sm text-red-700 mt-1">{voteError}</p>
              </div>
              <button
                onClick={onDismissError}
                className="flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <Card 
        id={generateAnchorId('question', question.id)}
        className="mb-6"
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-2 sm:gap-4">
            <VoteControls 
              votes={question.votes} 
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              isUpvoted={question.userVote === 'up'}
              isDownvoted={question.userVote === 'down'}
              isBookmarked={question.isBookmarked}
              isLoading={voteLoading}
              questionData={{
                id: question.id.toString(),
                title: question.title,
                content: question.content || question.excerpt || "",
                tags: question.tags,
                votes: question.votes,
                views: question.views?.toString() || "0",
                answers: question.answers,
                author: {
                  name: question.author.name,
                  reputation: question.author.reputation.toString(),
                  avatar: question.author.avatar
                }
              }}
            />
          
          <div className="flex-1 min-w-0">
            <ContentDisplay 
              content={question.content || question.excerpt || ""} 
              contentJson={question.contentJson}
              className="mb-4 sm:mb-6"
            />
            
            <Separator className="my-4" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <ActionButtons 
                onShare={onShare}
                onEdit={onEdit}
                onFlag={onFlag}
                canEdit={canEdit}
                shareUrl={shareUrl}
              />
              <AuthorCard 
                author={question.author} 
                timeAgo={question.timeAgo} 
                action="asked" 
              />
            </div>
            
            {/* Comments Section */}
            <div className="ml-12 sm:ml-16 mt-3">
              <CommentList comments={question.comments || []} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default QuestionSection;
