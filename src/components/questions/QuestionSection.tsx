"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ContentDisplay from "./ContentDisplay";
import { VoteControls, ActionButtons, AuthorCard } from "./PostControls";
import CommentList from "./CommentList";
import type { Question } from "@/types/questions";

interface QuestionSectionProps {
  question: Question;
  onVote?: (type: 'up' | 'down') => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onFlag?: () => void;
  currentUserId?: string;
}

const QuestionSection = ({ 
  question,
  onVote,
  onBookmark,
  onShare,
  onEdit,
  onFlag,
  currentUserId 
}: QuestionSectionProps) => {
  const canEdit = currentUserId === question.author.id;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleUpvote = () => onVote?.('up');
  const handleDownvote = () => onVote?.('down');

  return (
    <Card className="mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-4">
          <VoteControls 
            votes={question.votes} 
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            onBookmark={onBookmark}
            isUpvoted={question.userVote === 'up'}
            isDownvoted={question.userVote === 'down'}
            isBookmarked={question.isBookmarked}
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
              {question.comments && question.comments.length > 0 ? (
                <CommentList comments={question.comments} />
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  Add a comment
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionSection;
