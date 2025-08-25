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
  content?: string;
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
