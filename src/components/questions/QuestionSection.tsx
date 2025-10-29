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
}

const QuestionSection = ({ 
  question,
  onVote,
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
  );
};

export default QuestionSection;
