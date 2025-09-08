// Notification types for the application
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  avatar?: string;
  actionUrl?: string;
  // Navigation data for scrolling to specific positions
  targetId?: string; // ID of element to scroll to (answer, comment, etc.)
  targetType?: 'answer' | 'comment' | 'question' | 'mention';
  questionId?: number;
  userId?: string;
}

export type NotificationType = 
  | 'new_answer'
  | 'new_comment'
  | 'mention'
  | 'vote_received'
  | 'answer_accepted'
  | 'badge_earned'
  | 'question_followed'
  | 'reputation_milestone'
  | 'bounty_awarded'
  | 'system_announcement';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  lastFetched: Date | null;
}

// Action types for notification operations
export interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  fetchNotifications: () => Promise<void>;
}

// Notification preferences (for future use)
export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: {
    [key in NotificationType]: boolean;
  };
}
