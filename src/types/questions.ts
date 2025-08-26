export interface User {
  name: string;
  reputation: number;
  avatar?: string;
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
  author: User;
  timeAgo: string;
  isAccepted: boolean;
  comments?: Comment[];
}

export interface Question {
  id: number;
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
  answers_data?: Answer[];
  comments?: Comment[];
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
