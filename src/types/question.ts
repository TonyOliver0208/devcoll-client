export interface Question {
  id: number;
  title: string;
  votes: number;
  answers: number;
  views: number;
  tags: string[];
  timeAgo: string;
  author: {
    name: string;
    reputation: number;
    avatar?: string;
  };
  hasAcceptedAnswer?: boolean;
  bountyAmount?: number;
  excerpt?: string;
  // User interaction states
  isBookmarked?: boolean;
  isWatching?: boolean;
  userVote?: 'up' | 'down' | null;
}

export interface QuestionFilter {
  id: string;
  label: string;
  badge?: string;
  count?: number;
}
