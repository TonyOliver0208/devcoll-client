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
  questionData,
}: VoteControlsProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { saveQuestion, unsaveItem, isItemSaved, savedLists } = useSavedItems();
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [selectedList, setSelectedList] = useState("For later");
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleBookmarkClick = () => {
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

    if (!questionData) return;
    
    const itemId = `question_${questionData.id}`;
    const isSaved = isItemSaved(itemId);
    
    if (isSaved) {
      // If already saved, remove it
      unsaveItem(itemId);
      setNotificationMessage("Removed from saved items");
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } else {
      // If not saved, save to "For later" list by default
      saveQuestion(questionData, "For later");
      setNotificationMessage(`Saved to "${selectedList}" list`);
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
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
    <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-[50px] sm:min-w-[60px]">
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full hover:bg-orange-50 ${
          isUpvoted ? "text-orange-600 bg-orange-50" : "text-gray-500"
        }`}
        onClick={onUpvote}
        aria-label="Upvote"
      >
        <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8" />
      </Button>

      <div
        className={`text-xl sm:text-2xl font-bold ${
          votes > 0
            ? "text-gray-800"
            : votes < 0
            ? "text-red-600"
            : "text-gray-600"
        }`}
      >
        {votes}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full hover:bg-orange-50 ${
          isDownvoted ? "text-orange-600 bg-orange-50" : "text-gray-500"
        }`}
        onClick={onDownvote}
        aria-label="Downvote"
      >
        <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" />
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
            }`}
            onClick={handleBookmarkClick}
            aria-label={session ? (isSaved ? "Remove bookmark" : "Add bookmark") : "Login to save items"}
            title={session ? (isSaved ? "Remove bookmark" : "Add bookmark") : "Login to save items"}
          >
            <Bookmark
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${
                isSaved ? "fill-current text-blue-600" : ""
              }`}
            />
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
