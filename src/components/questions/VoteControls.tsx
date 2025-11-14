"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, Bookmark, Share, Edit, Flag, Check, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedItems } from "@/store/savedItemsStore";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface VoteControlsProps {
  votes: number;
  isAccepted?: boolean;
  onUpvote?: () => void;
  onDownvote?: () => void;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  isBookmarked?: boolean;
  isLoading?: boolean; // Loading state for voting
  // Add question data for saving
  questionData?: {
    id: string;
    title: string;
    content?: string;
    tags?: string[];
    votes?: number;
    views?: string;
    answers?: number;
    author?: {
      name: string;
      reputation: string;
      avatar?: string;
    };
  };
}

const VoteControls = ({
  votes,
  isAccepted,
  onUpvote,
  onDownvote,
  isUpvoted = false,
  isDownvoted = false,
  isBookmarked = false,
  isLoading = false,
  questionData,
}: VoteControlsProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { saveQuestion, unsaveItem, isItemSaved, savedLists } = useSavedItems();
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [selectedList, setSelectedList] = useState("For later");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const handleBookmarkClick = async () => {
    // Check if user is authenticated
    if (!session) {
      setNotificationMessage("Please log in to save items");
      setShowSaveNotification(true);
      setTimeout(() => {
        setShowSaveNotification(false);
        router.push("/login");
      }, 2000);
      return;
    }

    if (!questionData || favoriteLoading) return;
    
    setFavoriteLoading(true);
    setFavoriteError(null);
    
    try {
      const { questionsApi } = await import('@/services/questions.api');
      
      // Toggle favorite on backend
      const result = await questionsApi.favoriteQuestion(questionData.id, selectedList);
      
      // Update local state
      const itemId = `question_${questionData.id}`;
      
      if (result.isFavorited) {
        // Save to local store as well for consistency
        saveQuestion(questionData, selectedList);
        setNotificationMessage(`Saved to "${selectedList}" list`);
      } else {
        // Remove from local store
        unsaveItem(itemId);
        setNotificationMessage("Removed from saved items");
      }
      
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to save item. Please try again.';
      setFavoriteError(errorMessage);
      setTimeout(() => setFavoriteError(null), 5000);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleManageClick = () => {
    // Check if user is authenticated
    if (!session) {
      setNotificationMessage("Please log in to manage saved items");
      setShowSaveNotification(true);
      setTimeout(() => {
        setShowSaveNotification(false);
        router.push("/login");
      }, 2000);
      return;
    }
    
    setShowSaveNotification(false);
    setShowListDialog(true);
  };

  const handleListSelect = (listName: string) => {
    // Check if user is authenticated (additional safety check)
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (!questionData) return;
    
    saveQuestion(questionData, listName);
    setSelectedList(listName);
    setShowListDialog(false);
    
    // Show updated notification
    setNotificationMessage(`Saved to "${listName}" list`);
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  // Only check if item is saved when user is authenticated
  const isSaved = session && questionData ? isItemSaved(`question_${questionData.id}`) : false;
  return (
    <>
      {/* Favorite Error Popup */}
      {favoriteError && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top-5">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Favorite Failed</h3>
                <p className="text-sm text-red-700 mt-1">{favoriteError}</p>
              </div>
              <button
                onClick={() => setFavoriteError(null)}
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

      <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-[50px] sm:min-w-[60px]">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full hover:bg-orange-50 ${
            isUpvoted ? "text-orange-600 bg-orange-50" : "text-gray-500"
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={onUpvote}
          aria-label="Upvote"
          disabled={isLoading}
        >
          {isLoading && isUpvoted ? (
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8" />
          )}
        </Button>

        <div
          className={`text-xl sm:text-2xl font-bold ${
            votes > 0
              ? "text-gray-800"
              : votes < 0
              ? "text-red-600"
              : "text-gray-600"
          } ${isLoading ? 'opacity-50' : ''}`}
        >
          {votes}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full hover:bg-orange-50 ${
            isDownvoted ? "text-orange-600 bg-orange-50" : "text-gray-500"
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={onDownvote}
          aria-label="Downvote"
          disabled={isLoading}
        >
          {isLoading && isDownvoted ? (
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" />
          )}
        </Button>

      {isAccepted ? (
        <div
          className="text-green-600 text-xl font-bold mt-1 sm:mt-2"
          aria-label="Accepted answer"
        >
          ✓
        </div>
      ) : (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full mt-1 sm:mt-2 transition-colors ${
              isSaved 
                ? "text-blue-600 bg-blue-100 hover:bg-blue-200 border border-blue-300" 
                : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
            } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleBookmarkClick}
            aria-label={session ? (isSaved ? "Remove bookmark" : "Add bookmark") : "Login to save items"}
            title={session ? (isSaved ? "Remove bookmark" : "Add bookmark") : "Login to save items"}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Bookmark
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${
                  isSaved ? "fill-current text-blue-600" : ""
                }`}
              />
            )}
          </Button>

          {/* Save Notification Popup */}
          {showSaveNotification && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
              <div className="flex items-center gap-2">
                {notificationMessage.includes("Removed") ? (
                  <X size={16} className="text-red-400" />
                ) : notificationMessage.includes("Please log in") ? (
                  <X size={16} className="text-yellow-400" />
                ) : (
                  <Check size={16} className="text-green-400" />
                )}
                <span>{notificationMessage}</span>
                {session && !notificationMessage.includes("Removed") && !notificationMessage.includes("Please log in") && (
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="text-blue-300 hover:text-blue-200 p-1 h-auto ml-2"
                    onClick={handleManageClick}
                  >
                    Manage
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* List Selection Dialog */}
          <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Choose a list</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-4">
                {Object.values(savedLists).map((list: any) => (
                  <Button
                    key={list.id}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => handleListSelect(list.name)}
                  >
                    <div>
                      <div className="font-medium">{list.name}</div>
                      {list.description && (
                        <div className="text-sm text-gray-500">{list.description}</div>
                      )}
                      <div className="text-xs text-gray-400">{list.itemCount || 0} items</div>
                    </div>
                  </Button>
                ))}
                
                <hr className="my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-blue-600"
                  onClick={() => {
                    // TODO: Implement create new list functionality
                    console.log("Create new list");
                  }}
                >
                  <Settings size={16} className="mr-2" />
                  Create new list
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      </div>
    </>
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
  shareUrl,
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
    id?: string;
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
  variant?: "default" | "compact";
}

const AuthorCard = ({
  author,
  timeAgo,
  action,
  variant = "default",
}: AuthorCardProps) => {
  const formatReputation = (rep: number) => {
    if (rep >= 1000) {
      return `${Math.floor(rep / 1000)}k`;
    }
    return rep.toString();
  };

  if (variant === "compact") {
    return (
      <div className="text-xs text-gray-600">
        {action} {timeAgo} by{" "}
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
          src={author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&size=32&background=random`}
          alt={author.name}
          className="w-8 h-8 rounded"
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
                  <span className="text-gray-400 ml-1">
                    ●{author.badges.silver}
                  </span>
                )}
                {author.badges.bronze > 0 && (
                  <span className="text-amber-600 ml-1">
                    ●{author.badges.bronze}
                  </span>
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
