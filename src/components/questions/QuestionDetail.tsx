"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { Question } from "@/types/questions";
import RightSidebar from "@/components/home/RightSidebar";
import QuestionSection from "./QuestionSection";
import AnswerSection from "./AnswerSection";
import YourAnswer from "./YourAnswer";
import { handleHashNavigation } from "@/lib/scrollUtils";
import { questionKeys } from "@/hooks/use-questions";
import { useCreateAnswer, useVoteAnswer, useAcceptAnswer, useAnswers } from "@/hooks/use-answers";
import { useQuestionComments } from "@/hooks/use-comments";
import toast from "react-hot-toast";

interface QuestionDetailProps {
  question: Question;
  currentUserId?: string;
}

const QuestionDetail = ({ question, currentUserId }: QuestionDetailProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createAnswer = useCreateAnswer();
  const voteAnswer = useVoteAnswer();
  const acceptAnswer = useAcceptAnswer();
  
  // Fetch answers separately using the API
  const { data: answersData, isLoading: answersLoading } = useAnswers(question.id.toString());
  
  // Fetch question comments
  const { data: questionCommentsData } = useQuestionComments(question.id.toString());
  
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isVoteOperation, setIsVoteOperation] = useState(false); // Track if we're in the middle of voting
  const [isFavoriteOperation, setIsFavoriteOperation] = useState(false); // Track if we're in the middle of favoriting
  const [currentVotes, setCurrentVotes] = useState({
    total: question.votes,
    userVote: question.userVote,
    upvotes: 0,
    downvotes: 0,
  });
  const [currentFavoriteState, setCurrentFavoriteState] = useState(question.isBookmarked || false);

  // Sync votes with question prop changes (after refetch)
  // BUT only if we're not in the middle of a vote operation
  useEffect(() => {
    if (isVoteOperation) {
      console.log('[QuestionDetail] Skipping vote sync during operation');
      return;
    }
    
    console.log('[QuestionDetail] Syncing votes from question prop:', {
      votes: question.votes,
      userVote: question.userVote,
    });
    setCurrentVotes({
      total: question.votes,
      userVote: question.userVote,
      upvotes: 0,
      downvotes: 0,
    });
  }, [question.votes, question.userVote, isVoteOperation]);

  // Sync favorite state with question prop changes (after refetch)
  // BUT only if we're not in the middle of a favorite operation
  useEffect(() => {
    if (isFavoriteOperation) {
      console.log('[QuestionDetail] Skipping favorite sync during operation');
      return;
    }
    
    console.log('[QuestionDetail] Syncing favorite from question prop:', question.isBookmarked);
    setCurrentFavoriteState(question.isBookmarked || false);
  }, [question.isBookmarked, isFavoriteOperation]);

  // Handle hash navigation on component mount
  useEffect(() => {
    handleHashNavigation();
  }, []);

  // Question interaction handlers with optimistic updates
  const handleQuestionVote = async (type: 'up' | 'down') => {
    if (voteLoading) return; // Prevent double clicks
    
    setIsVoteOperation(true); // Mark that we're voting
    setVoteLoading(true);
    setVoteError(null);
    
    // Optimistic update
    const prevVotes = { ...currentVotes };
    const wasVoted = currentVotes.userVote === type;
    const wasDifferentVote = currentVotes.userVote && currentVotes.userVote !== type;
    
    let newTotal = currentVotes.total;
    let newUserVote: 'up' | 'down' | null = null;
    
    if (wasVoted) {
      // Toggle off - remove vote
      newTotal = type === 'up' ? newTotal - 1 : newTotal + 1;
      newUserVote = null;
    } else if (wasDifferentVote) {
      // Switch vote
      newTotal = type === 'up' ? newTotal + 2 : newTotal - 2;
      newUserVote = type;
    } else {
      // New vote
      newTotal = type === 'up' ? newTotal + 1 : newTotal - 1;
      newUserVote = type;
    }
    
    setCurrentVotes(prev => ({
      ...prev,
      total: newTotal,
      userVote: newUserVote,
    }));
    
    try {
      const { questionsApi } = await import('@/services/questions.api');
      const result = await questionsApi.voteQuestion(question.id.toString(), type);
      
      console.log('[QuestionDetail] Vote result from server:', result);
      
      // Update with real data from server
      setCurrentVotes({
        total: result.totalVotes,
        userVote: result.userVote as 'up' | 'down' | null,
        upvotes: result.upvotes,
        downvotes: result.downvotes,
      });
      
      // Invalidate queries and wait for refetch to complete
      await queryClient.invalidateQueries({
        queryKey: questionKeys.detail(question.id.toString()),
        refetchType: 'active',
      });
      
      // Also invalidate question lists (background)
      queryClient.invalidateQueries({
        queryKey: questionKeys.lists(),
      });
    } catch (error: any) {
      console.error('Failed to vote:', error);
      // Revert optimistic update
      setCurrentVotes(prevVotes);
      
      // Show error message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to vote. Please try again.';
      setVoteError(errorMessage);
      
      // Auto-hide error after 5 seconds
      setTimeout(() => setVoteError(null), 5000);
    } finally {
      setVoteLoading(false);
      // Wait a bit to ensure refetch has propagated, then resume sync
      setTimeout(() => setIsVoteOperation(false), 100);
    }
  };

  const handleQuestionShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: question.title, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleQuestionEdit = () => {
    router.push(`/questions/${question.id}/edit`);
  };

  const handleQuestionFlag = () => {
    console.log('Flag question');
  };

  const handleQuestionFavorite = async (isFavorited: boolean) => {
    // This will be called from VoteControls after the favorite operation completes
    console.log('[QuestionDetail] Favorite changed to:', isFavorited);
    setIsFavoriteOperation(true);
    setCurrentFavoriteState(isFavorited);
    
    // Invalidate queries and wait for refetch
    await queryClient.invalidateQueries({
      queryKey: questionKeys.detail(question.id.toString()),
      refetchType: 'active',
    });
    
    // Wait a bit then resume sync
    setTimeout(() => setIsFavoriteOperation(false), 100);
  };

  // Answer interaction handlers
  const handleAnswerVote = async (answerId: number, type: 'up' | 'down') => {
    if (!currentUserId) {
      toast.error("Please sign in to vote.");
      return;
    }

    try {
      await voteAnswer.mutateAsync({
        answerId: String(answerId),
        voteType: type,
        questionId: String(question.id),
      });
    } catch (error) {
      console.error('Failed to vote on answer:', error);
      toast.error(error instanceof Error ? error.message : "Failed to vote on answer");
    }
  };

  const handleAnswerAccept = async (answerId: number) => {
    if (!currentUserId) {
      toast.error("Please sign in to accept an answer.");
      return;
    }

    if (!canAcceptAnswers) {
      toast.error("Only the question author can accept answers.");
      return;
    }

    try {
      await acceptAnswer.mutateAsync({
        answerId: String(answerId),
        questionId: String(question.id),
      });
      toast.success("Answer accepted!");
    } catch (error) {
      console.error('Failed to accept answer:', error);
      toast.error(error instanceof Error ? error.message : "Failed to accept answer");
    }
  };

  const handleAnswerShare = (answerId: number) => {
    const url = `${window.location.href}#answer-${answerId}`;
    if (navigator.share) {
      navigator.share({ url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleAnswerEdit = (answerId: number) => {
    router.push(`/questions/${question.id}/answers/${answerId}/edit`);
  };

  const handleAnswerFlag = (answerId: number) => {
    console.log(`Flag answer ${answerId}`);
  };

  // Submit new answer
  const handleSubmitAnswer = async (content: any) => {
    console.log('[handleSubmitAnswer] Starting submission', { currentUserId, hasContent: !!content });
    
    if (!currentUserId) {
      console.warn('[handleSubmitAnswer] No user ID - user not logged in');
      toast.error("Please sign in to post an answer.");
      router.push('/login');
      return;
    }

    setIsSubmittingAnswer(true);
    const loadingToast = toast.loading("Posting your answer...");
    
    try {
      // Convert Tiptap JSON to HTML string for now
      // You can adjust this based on your backend's content format expectations
      const contentString = typeof content === 'string' ? content : JSON.stringify(content);
      
      console.log('[handleSubmitAnswer] Calling API with:', {
        questionId: String(question.id),
        contentLength: contentString.length,
      });
      
      const result = await createAnswer.mutateAsync({
        questionId: String(question.id),
        content: contentString,
      });

      console.log('[handleSubmitAnswer] Answer created successfully:', result);
      toast.success("Your answer has been successfully posted!", { id: loadingToast });
    } catch (error) {
      console.error('[handleSubmitAnswer] Failed to submit answer:', error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while posting your answer.";
      toast.error(errorMessage, { id: loadingToast });
      throw error;
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const canAcceptAnswers = currentUserId === question.author.id;

  return (
    <main className="flex-1 lg:ml-0">
      <div className="py-3 sm:py-6">
        <div className="px-2 sm:px-4">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Link 
              href="/questions" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Questions
            </Link>
          </div>

          {/* Question Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-normal text-gray-900 mb-2 leading-tight">
              {question.title}
            </h1>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 mb-4">
              <div>Asked <span className="font-medium">{question.timeAgo}</span></div>
              <div>Modified <span className="font-medium">today</span></div>
              <div>Viewed <span className="font-medium">{question.views.toLocaleString()} times</span></div>
            </div>
            
            {/* Question Tags */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
              {question.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/questions/tagged/${tag}`}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {/* Question & Answers Content */}
            <div className="lg:col-span-2 xl:col-span-3">
              {/* Question */}
              <QuestionSection
                question={{
                  ...question,
                  votes: currentVotes.total,
                  userVote: currentVotes.userVote,
                  comments: questionCommentsData?.comments?.map((comment: any) => ({
                    id: comment.id || `comment-${Math.random()}`,
                    content: comment.content,
                    author: {
                      id: comment.userId,
                      name: comment.authorName || 'Unknown User',
                      avatar: comment.authorAvatar || '',
                      reputation: 0,
                    },
                    timeAgo: new Date(comment.createdAt).toLocaleString(),
                    votes: comment.votes || 0,
                  })) || [],
                }}
                onVote={handleQuestionVote}
                onShare={handleQuestionShare}
                onEdit={handleQuestionEdit}
                onFlag={handleQuestionFlag}
                onFavoriteChange={handleQuestionFavorite}
                favoriteState={currentFavoriteState}
                currentUserId={currentUserId}
                voteLoading={voteLoading}
                voteError={voteError}
                onDismissError={() => setVoteError(null)}
              />

              {/* Answers */}
              {answersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading answers...</p>
                </div>
              ) : answersData?.answers && answersData.answers.length > 0 ? (
                <AnswerSection
                  answers={answersData.answers.map((answer: any) => {
                    // Try to parse as JSON, but handle HTML content gracefully
                    let contentJson = null;
                    if (typeof answer.content === 'string') {
                      // Check if it's JSON (starts with '{' or '[') or HTML (contains '<')
                      if (answer.content.trim().startsWith('{') || answer.content.trim().startsWith('[')) {
                        try {
                          contentJson = JSON.parse(answer.content);
                        } catch (e) {
                          // If parsing fails, leave as null - will use HTML rendering
                          console.log('[QuestionDetail] Content is not valid JSON, using HTML rendering');
                        }
                      }
                    } else {
                      contentJson = answer.content;
                    }
                    
                    return {
                      id: answer.id,
                      votes: answer.totalVotes || 0,
                      content: answer.content,
                      contentJson: contentJson,
                      author: answer.author || {
                        id: answer.authorId,
                        name: answer.authorName || 'Unknown User',
                        avatar: answer.authorAvatar || '',
                        reputation: 0,
                      },
                      timeAgo: new Date(answer.createdAt).toLocaleString(),
                      isAccepted: answer.isAccepted || false,
                      comments: answer.comments?.map((comment: any) => ({
                        id: comment.id || `comment-${Math.random()}`,
                        content: comment.content,
                        author: {
                          id: comment.userId,
                          name: comment.authorName || 'Unknown User',
                          avatar: comment.authorAvatar || '',
                          reputation: 0,
                        },
                        timeAgo: new Date(comment.createdAt).toLocaleString(),
                        votes: comment.votes || 0,
                      })) || [],
                      userVote: answer.userVote,
                    };
                  })}
                  totalAnswers={answersData.answers.length}
                  questionId={question.id}
                  onVote={handleAnswerVote}
                  onAccept={handleAnswerAccept}
                  onShare={handleAnswerShare}
                  onEdit={handleAnswerEdit}
                  onFlag={handleAnswerFlag}
                  currentUserId={currentUserId}
                  canAcceptAnswers={canAcceptAnswers}
                />
              ) : !answersLoading && (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mb-6">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No answers yet
                  </h3>
                  <p className="text-gray-600">
                    Be the first to answer this question!
                  </p>
                </div>
              )}

              {/* Your Answer */}
              <YourAnswer
                questionId={question.id.toString()}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmittingAnswer}
                currentUserId={currentUserId}
              />
            </div>

            {/* Right Sidebar */}
            <aside className="lg:col-span-1 xl:col-span-1 order-first lg:order-last">
              <div className="lg:sticky lg:top-[120px]">
                <RightSidebar />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
};

export default QuestionDetail;
