"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, Bookmark, Share, Edit, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoteControlsProps {
  votes: number;
  isAccepted?: boolean;
  onUpvote?: () => void;
  onDownvote?: () => void;
  onBookmark?: () => void;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  isBookmarked?: boolean;
}

const VoteControls = ({ 
  votes, 
  isAccepted,
  onUpvote,
  onDownvote,
  onBookmark,
  isUpvoted = false,
  isDownvoted = false,
  isBookmarked = false
}: VoteControlsProps) => {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-[50px] sm:min-w-[60px]">
      <Button 
        variant="ghost" 
        size="icon" 
        className={`rounded-full hover:bg-orange-50 ${isUpvoted ? 'text-orange-600 bg-orange-50' : 'text-gray-500'}`}
        onClick={onUpvote}
        aria-label="Upvote"
      >
        <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8" />
      </Button>
      
      <div className={`text-xl sm:text-2xl font-bold ${
        votes > 0 ? 'text-gray-800' : votes < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {votes}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className={`rounded-full hover:bg-orange-50 ${isDownvoted ? 'text-orange-600 bg-orange-50' : 'text-gray-500'}`}
        onClick={onDownvote}
        aria-label="Downvote"
      >
        <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" />
      </Button>
      
      {isAccepted ? (
        <div className="text-green-600 text-xl font-bold mt-1 sm:mt-2" aria-label="Accepted answer">
          ✓
        </div>
      ) : (
        <Button 
          variant="ghost" 
          size="icon" 
          className={`rounded-full mt-1 sm:mt-2 hover:bg-blue-50 ${isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
          onClick={onBookmark}
          aria-label="Bookmark"
        >
          <Bookmark className={`w-5 h-5 sm:w-6 sm:h-6 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      )}
    </div>
  );
};

interface ActionButtonsProps {
  onShare?: () => void;
  onEdit?: () => void;
  onFlag?: () => void;
  canEdit?: boolean;
  shareUrl?: string;
}

const ActionButtons = ({ 
  onShare, 
  onEdit, 
  onFlag, 
  canEdit = false,
  shareUrl 
}: ActionButtonsProps) => {
  const handleShare = () => {
    if (shareUrl && navigator.share) {
      navigator.share({ url: shareUrl });
    } else if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
    onShare?.();
  };

  return (
    <div className="flex gap-3 sm:gap-4 text-sm">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-gray-500 hover:text-gray-700 p-0 h-auto flex items-center gap-1"
        onClick={handleShare}
      >
        <Share className="w-3 h-3" />
        Share
      </Button>
      
      {canEdit && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 hover:text-gray-700 p-0 h-auto flex items-center gap-1"
          onClick={onEdit}
        >
          <Edit className="w-3 h-3" />
          Edit
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-gray-500 hover:text-gray-700 p-0 h-auto flex items-center gap-1"
        onClick={onFlag}
      >
        <Flag className="w-3 h-3" />
        Flag
      </Button>
    </div>
  );
};

interface AuthorCardProps {
  author: {
    id: string;
    name: string;
    reputation: number;
    avatar?: string;
    badges?: {
      gold: number;
      silver: number;
      bronze: number;
    };
  };
  timeAgo: string;
  action: string;
  variant?: 'default' | 'compact';
}

const AuthorCard = ({ 
  author, 
  timeAgo, 
  action, 
  variant = 'default' 
}: AuthorCardProps) => {
  const formatReputation = (rep: number) => {
    if (rep >= 1000) {
      return `${Math.floor(rep / 1000)}k`;
    }
    return rep.toString();
  };

  if (variant === 'compact') {
    return (
      <div className="text-xs text-gray-600">
        {action} {timeAgo} by{' '}
        <Link 
          href={`/users/${author.id}`} 
          className="text-blue-600 hover:text-blue-800"
        >
          {author.name}
        </Link>
        <span className="text-gray-400 ml-1">
          ({formatReputation(author.reputation)})
        </span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-2 sm:p-3 rounded self-start sm:self-auto">
      <div className="text-xs text-gray-600 mb-1">
        {action} {timeAgo}
      </div>
      <div className="flex items-center gap-2">
        <img
          src={author.avatar || "/api/placeholder/32/32"}
          alt={author.name}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded"
        />
        <div>
          <Link 
            href={`/users/${author.id}`}
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium break-words"
          >
            {author.name}
          </Link>
          <div className="text-xs text-gray-600">
            {formatReputation(author.reputation)}
            {author.badges && (
              <span className="ml-1">
                {author.badges.gold > 0 && (
                  <span className="text-yellow-600">●{author.badges.gold}</span>
                )}
                {author.badges.silver > 0 && (
                  <span className="text-gray-400 ml-1">●{author.badges.silver}</span>
                )}
                {author.badges.bronze > 0 && (
                  <span className="text-amber-600 ml-1">●{author.badges.bronze}</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { VoteControls, ActionButtons, AuthorCard };
