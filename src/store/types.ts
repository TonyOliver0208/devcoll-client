// Store types for TypeScript support
import { Question } from "@/types/question";
import { Tag } from "@/types/tag";
import { AISuggestion } from "@/services/mockAIService";

// Question Form State
export interface QuestionFormData {
  title: string;
  content: any;
  contentHtml: string;
  tags: string[];
}

export interface QuestionDraft extends QuestionFormData {
  id: string;
  lastModified: number;
  isAutoSaved: boolean;
}

// AI Assistant State
export interface AIAssistantState {
  isAnalyzing: boolean;
  suggestions: AISuggestion | null;
  error: string | null;
  lastAnalyzedContent: {
    title: string;
    content: string;
  } | null;
}

// Questions Feed State
export interface QuestionsState {
  questions: Question[];
  loading: boolean;
  error: string | null;
  currentFilter: string;
  searchQuery: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

// Tags State
export interface TagsState {
  allTags: Tag[];
  trendingTags: Tag[];
  userTags: string[];
  suggestedTags: string[];
  loading: boolean;
  error: string | null;
  currentFilter: string;
  searchQuery: string;
}

// User Interactions State
export interface UserInteractionsState {
  votedQuestions: Record<number, 'up' | 'down'>;
  votedAnswers: Record<number, 'up' | 'down'>;
  bookmarkedQuestions: number[];
  bookmarkedAnswers: number[];
  followedTags: string[];
  watchingQuestions: number[];
}

// Draft Management
export interface DraftState {
  questionDrafts: Record<string, QuestionDraft>;
  answerDrafts: Record<string, { content: string; lastModified: number }>;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
}
