// Utility functions to simulate notification events for testing purposes

import { useNotificationStore } from '@/store/notificationStore';
import { NotificationType } from '@/types/notification';

export const useNotificationSimulator = () => {
  const { addNotification } = useNotificationStore();

  const simulateNewAnswer = (questionId: number, answerId: string, authorName: string) => {
    addNotification({
      type: 'new_answer',
      title: 'New answer on your question',
      message: `${authorName} answered your question "How to implement authentication in Next.js?"`,
      isRead: false,
      avatar: '/api/placeholder/32/32',
      actionUrl: `/questions/${questionId}`,
      targetId: `answer-${answerId}`,
      targetType: 'answer',
      questionId,
      userId: 'user-' + authorName.toLowerCase().replace(/\s+/g, '-')
    });
  };

  const simulateNewComment = (questionId: number, commentId: string, authorName: string) => {
    addNotification({
      type: 'new_comment',
      title: 'New comment on your answer',
      message: `${authorName} commented on your answer about "React state management"`,
      isRead: false,
      avatar: '/api/placeholder/32/32',
      actionUrl: `/questions/${questionId}`,
      targetId: `comment-${commentId}`,
      targetType: 'comment',
      questionId,
      userId: 'user-' + authorName.toLowerCase().replace(/\s+/g, '-')
    });
  };

  const simulateMention = (questionId: number, commentId: string, authorName: string) => {
    addNotification({
      type: 'mention',
      title: 'You were mentioned',
      message: `${authorName} mentioned you in a comment on "TypeScript best practices"`,
      isRead: false,
      avatar: '/api/placeholder/32/32',
      actionUrl: `/questions/${questionId}`,
      targetId: `comment-${commentId}`,
      targetType: 'mention',
      questionId,
      userId: 'user-' + authorName.toLowerCase().replace(/\s+/g, '-')
    });
  };

  const simulateVoteReceived = (questionId: number, answerId: string, voteCount: number) => {
    addNotification({
      type: 'vote_received',
      title: 'Your answer was upvoted',
      message: `Your answer about "Database optimization" received ${voteCount} upvotes`,
      isRead: false,
      actionUrl: `/questions/${questionId}`,
      targetId: `answer-${answerId}`,
      targetType: 'answer',
      questionId
    });
  };

  const simulateAnswerAccepted = (questionId: number, answerId: string, authorName: string) => {
    addNotification({
      type: 'answer_accepted',
      title: 'Your answer was accepted',
      message: `${authorName} accepted your answer on "Node.js performance tips"`,
      isRead: false,
      avatar: '/api/placeholder/32/32',
      actionUrl: `/questions/${questionId}`,
      targetId: `answer-${answerId}`,
      targetType: 'answer',
      questionId,
      userId: 'user-' + authorName.toLowerCase().replace(/\s+/g, '-')
    });
  };

  return {
    simulateNewAnswer,
    simulateNewComment,
    simulateMention,
    simulateVoteReceived,
    simulateAnswerAccepted
  };
};
