'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  X, 
  Check, 
  Settings, 
  MoreHorizontal,
  MessageSquare,
  User,
  ThumbsUp,
  CheckCircle,
  Trophy,
  Eye,
  Star,
  DollarSign,
  Megaphone
} from 'lucide-react';
import { useNotificationStore, getTimeAgo } from '@/store/notificationStore';
import { Notification, NotificationType } from '@/types/notification';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Close dropdown
    onClose();

    // Navigate to the target URL with scroll behavior
    if (notification.actionUrl) {
      if (notification.targetId && notification.targetType) {
        // Add hash for scrolling to specific element
        router.push(`${notification.actionUrl}#${notification.targetId}`);
      } else {
        router.push(notification.actionUrl);
      }
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { size: 16, className: "text-blue-600" };
    
    switch (type) {
      case 'new_answer':
        return <MessageSquare {...iconProps} />;
      case 'new_comment':
        return <MessageSquare {...iconProps} className="text-green-600" />;
      case 'mention':
        return <User {...iconProps} className="text-purple-600" />;
      case 'vote_received':
        return <ThumbsUp {...iconProps} className="text-orange-600" />;
      case 'answer_accepted':
        return <CheckCircle {...iconProps} className="text-green-600" />;
      case 'badge_earned':
        return <Trophy {...iconProps} className="text-yellow-600" />;
      case 'question_followed':
        return <Eye {...iconProps} className="text-gray-600" />;
      case 'reputation_milestone':
        return <Star {...iconProps} className="text-yellow-600" />;
      case 'bounty_awarded':
        return <DollarSign {...iconProps} className="text-green-600" />;
      case 'system_announcement':
        return <Megaphone {...iconProps} className="text-blue-600" />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">
              You'll see notifications here when you have activity
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onDelete={() => deleteNotification(notification.id)}
                getIcon={getNotificationIcon}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <Link
            href="/profile?tab=notifications"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            onClick={onClose}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: () => void;
  getIcon: (type: NotificationType) => React.ReactNode;
}

function NotificationItem({ notification, onClick, onDelete, getIcon }: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group ${
        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        {/* Avatar or Icon */}
        <div className="flex-shrink-0">
          {notification.avatar ? (
            <div className="relative">
              <Image
                src={notification.avatar}
                alt="User avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                {getIcon(notification.type)}
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {getIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 line-clamp-3">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getTimeAgo(notification.timestamp)}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="absolute top-2 right-2 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete notification"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
