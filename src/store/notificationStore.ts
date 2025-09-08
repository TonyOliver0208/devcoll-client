import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { 
  Notification, 
  NotificationState, 
  NotificationActions,
  NotificationType 
} from '@/types/notification';

// Combined store interface
interface NotificationStore extends NotificationState, NotificationActions {}

// Mock data for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'new_answer',
    title: 'New answer on your question',
    message: 'John Doe answered your question "How to implement authentication in Next.js?"',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    avatar: '/api/placeholder/32/32',
    actionUrl: '/questions/123',
    targetId: 'answer-456',
    targetType: 'answer',
    questionId: 123,
    userId: 'user-john'
  },
  {
    id: '2',
    type: 'new_comment',
    title: 'New comment on your answer',
    message: 'Sarah Chen commented on your answer about "React state management"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    avatar: '/api/placeholder/32/32',
    actionUrl: '/questions/456',
    targetId: 'comment-789',
    targetType: 'comment',
    questionId: 456,
    userId: 'user-sarah'
  },
  {
    id: '3',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Alex Rodriguez mentioned you in a comment on "TypeScript best practices"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    isRead: false,
    avatar: '/api/placeholder/32/32',
    actionUrl: '/questions/789',
    targetId: 'comment-101',
    targetType: 'mention',
    questionId: 789,
    userId: 'user-alex'
  },
  {
    id: '4',
    type: 'vote_received',
    title: 'Your answer was upvoted',
    message: 'Your answer about "Database optimization" received 5 upvotes',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    isRead: true,
    actionUrl: '/questions/321',
    targetId: 'answer-111',
    targetType: 'answer',
    questionId: 321
  },
  {
    id: '5',
    type: 'answer_accepted',
    title: 'Your answer was accepted',
    message: 'Mike Johnson accepted your answer on "Node.js performance tips"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
    isRead: true,
    avatar: '/api/placeholder/32/32',
    actionUrl: '/questions/654',
    targetId: 'answer-222',
    targetType: 'answer',
    questionId: 654,
    userId: 'user-mike'
  }
];

export const useNotificationStore = create<NotificationStore>()(
  immer((set, get) => ({
    // Initial state
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter(n => !n.isRead).length,
    isLoading: false,
    lastFetched: null,

    // Actions
    addNotification: (notificationData) => 
      set((state) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          timestamp: new Date(),
          ...notificationData
        };
        
        state.notifications.unshift(newNotification);
        
        if (!newNotification.isRead) {
          state.unreadCount += 1;
        }
      }),

    markAsRead: (notificationId) =>
      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }),

    markAllAsRead: () =>
      set((state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      }),

    deleteNotification: (notificationId) =>
      set((state) => {
        const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex !== -1) {
          const notification = state.notifications[notificationIndex];
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(notificationIndex, 1);
        }
      }),

    clearAllNotifications: () =>
      set((state) => {
        state.notifications = [];
        state.unreadCount = 0;
      }),

    fetchNotifications: async () => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        // In a real app, this would be an API call
        // const response = await api.getNotifications();
        // For now, we'll simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set((state) => {
          state.lastFetched = new Date();
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.isLoading = false;
        });
        console.error('Failed to fetch notifications:', error);
      }
    }
  }))
);

// Utility functions
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'new_answer':
      return '💬';
    case 'new_comment':
      return '💭';
    case 'mention':
      return '👤';
    case 'vote_received':
      return '👍';
    case 'answer_accepted':
      return '✅';
    case 'badge_earned':
      return '🏆';
    case 'question_followed':
      return '👁️';
    case 'reputation_milestone':
      return '⭐';
    case 'bounty_awarded':
      return '💰';
    case 'system_announcement':
      return '📢';
    default:
      return '🔔';
  }
};

export const getTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return timestamp.toLocaleDateString();
};
