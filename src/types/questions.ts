export interface User {
  id?: string;
  name: string;
  reputation: number;
  avatar?: string;
  badges?: {
    gold: number;
    silver: number;
    bronze: number;
  };
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  timeAgo: string;
  votes?: number;
}

export interface Answer {
  id: number;
  votes: number;
  content: string;
  contentJson?: any; // Tiptap JSON format
  author: User;
  timeAgo: string;
  isAccepted: boolean;
  comments?: Comment[];
  userVote?: 'up' | 'down' | null;
  isBookmarked?: boolean;
  qualityScore?: number; // Quality score for moderation
}

export interface Question {
  id: number | string; // Support both numeric IDs (mock data) and UUID strings (API)
  title: string;
  votes: number;
  answers: number;
  views: number;
  tags: string[];
  timeAgo: string;
  author: User;
  hasAcceptedAnswer?: boolean;
  bountyAmount?: number;
  excerpt?: string;
  content?: string;
  contentJson?: any; // Tiptap JSON format
  answers_data?: Answer[];
  comments?: Comment[];
  userVote?: 'up' | 'down' | null;
  isBookmarked?: boolean;
}

export interface QuestionFilter {
  id: string;
  label: string;
  badge?: string;
  count?: number;
}

export type QuestionFeedProps = {
  questions: Question[];
  showHeader?: boolean;
  headerTitle?: string;
  headerCount?: string;
  showFilters?: boolean;
  showWelcome?: boolean;
  showSuggestedDevelopers?: boolean;
};
