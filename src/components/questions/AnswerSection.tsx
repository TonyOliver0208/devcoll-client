"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContentDisplay from "./ContentDisplay";
import { VoteControls, ActionButtons, AuthorCard } from "./PostControls";
import CommentList from "./CommentList";
import type { Answer } from "@/types/questions";

interface AnswerSectionProps {
  answers: Answer[];
  totalAnswers: number;
  onVote?: (answerId: number, type: 'up' | 'down') => void;
  onBookmark?: (answerId: number) => void;
  onAccept?: (answerId: number) => void;
  onShare?: (answerId: number) => void;
  onEdit?: (answerId: number) => void;
  onFlag?: (answerId: number) => void;
  currentUserId?: string;
  canAcceptAnswers?: boolean;
}

type SortOption = 'score' | 'trending' | 'newest' | 'oldest';

const AnswerSection = ({ 
  answers,
  totalAnswers,
  onVote,
  onBookmark,
  onAccept,
  onShare,
  onEdit,
  onFlag,
  currentUserId,
  canAcceptAnswers = false
}: AnswerSectionProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('score');

  if (!answers || answers.length === 0) {
    return null;
  }

  const sortedAnswers = [...answers].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        // You'd implement trending logic based on recent votes
        return b.votes - a.votes;
      case 'newest':
        // You'd sort by actual date, using timeAgo as proxy for now
        return a.timeAgo.localeCompare(b.timeAgo);
      case 'oldest':
        return b.timeAgo.localeCompare(a.timeAgo);
      case 'score':
      default:
        // Sort accepted answers first, then by score
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return b.votes - a.votes;
    }
  });

  const handleVote = (answerId: number, type: 'up' | 'down') => {
    onVote?.(answerId, type);
  };

  const getSortLabel = (value: SortOption) => {
    switch (value) {
      case 'score': return 'Highest score (default)';
      case 'trending': return 'Trending (recent votes count more)';
      case 'newest': return 'Date modified (newest first)';
      case 'oldest': return 'Date created (oldest first)';
    }
  };

  return (
    <div className="mt-6 sm:mt-8">
      {/* Header with sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-normal">
          {totalAnswers} Answer{totalAnswers !== 1 ? 's' : ''}
        </h2>
        
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">{getSortLabel('score')}</SelectItem>
            <SelectItem value="trending">{getSortLabel('trending')}</SelectItem>
            <SelectItem value="newest">{getSortLabel('newest')}</SelectItem>
            <SelectItem value="oldest">{getSortLabel('oldest')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Answers List */}
      <div className="space-y-6">
        {sortedAnswers.map((answer, index) => (
          <AnswerCard
            key={answer.id}
            answer={answer}
            onVote={(type: 'up' | 'down') => handleVote(answer.id, type)}
            onBookmark={() => onBookmark?.(answer.id)}
            onAccept={() => onAccept?.(answer.id)}
            onShare={() => onShare?.(answer.id)}
            onEdit={() => onEdit?.(answer.id)}
            onFlag={() => onFlag?.(answer.id)}
            currentUserId={currentUserId}
            canAccept={canAcceptAnswers}
            showSeparator={index < sortedAnswers.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

interface AnswerCardProps {
  answer: Answer;
  onVote: (type: 'up' | 'down') => void;
  onBookmark: () => void;
  onAccept: () => void;
  onShare: () => void;
  onEdit: () => void;
  onFlag: () => void;
  currentUserId?: string;
  canAccept: boolean;
  showSeparator?: boolean;
}

const AnswerCard = ({
  answer,
  onVote,
  onBookmark,
  onAccept,
  onShare,
  onEdit,
  onFlag,
  currentUserId,
  canAccept,
  showSeparator = false
}: AnswerCardProps) => {
  const canEdit = currentUserId === answer.author.id;

  return (
    <>
      <Card className={answer.isAccepted ? "border-green-200 bg-green-50/30" : ""}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-[50px] sm:min-w-[60px]">
              <VoteControls 
                votes={answer.votes}
                isAccepted={answer.isAccepted}
                onUpvote={() => onVote('up')}
                onDownvote={() => onVote('down')}
                onBookmark={onBookmark}
                isUpvoted={answer.userVote === 'up'}
                isDownvoted={answer.userVote === 'down'}
                isBookmarked={answer.isBookmarked}
              />
              
              {/* Accept Answer Button */}
              {canAccept && !answer.isAccepted && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full mt-2 hover:bg-green-50 text-gray-400 hover:text-green-600"
                  onClick={onAccept}
                  title="Accept this answer"
                >
                  ✓
                </Button>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {answer.isAccepted && (
                <div className="mb-3 flex items-center gap-2 text-green-700">
                  <span className="text-lg">✓</span>
                  <span className="text-sm font-medium">Accepted Answer</span>
                </div>
              )}
              
              <ContentDisplay 
                content={answer.content} 
                contentJson={answer.contentJson}
                className="mb-4 sm:mb-6"
              />
              
              {/* Low quality warning */}
              {answer.qualityScore && answer.qualityScore < 4 && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex items-center gap-2 text-orange-700 text-sm">
                    <span>⚠️</span>
                    <span>This answer may need improvement. Consider editing to add more detail or explanation.</span>
                  </div>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <ActionButtons 
                  onShare={onShare}
                  onEdit={onEdit}
                  onFlag={onFlag}
                  canEdit={canEdit}
                />
                <AuthorCard 
                  author={answer.author} 
                  timeAgo={answer.timeAgo} 
                  action="answered"
                  variant="compact"
                />
              </div>
              
              {/* Comments Section */}
              <div className="ml-12 sm:ml-16 mt-3">
                {answer.comments && answer.comments.length > 0 ? (
                  <CommentList comments={answer.comments} />
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
      
      {showSeparator && <Separator className="my-6" />}
    </>
  );
};

export default AnswerSection;
