"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Question } from "@/types/question";
import { QuestionsState } from "./types";

interface QuestionsStore extends QuestionsState {
  // Actions
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (questionId: number, updates: Partial<Question>) => void;
  removeQuestion: (questionId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  setPagination: (pagination: Partial<QuestionsState['pagination']>) => void;
  
  // Question interactions
  voteQuestion: (questionId: number, voteType: 'up' | 'down') => void;
  bookmarkQuestion: (questionId: number) => void;
  watchQuestion: (questionId: number) => void;
  
  // Fetching actions
  fetchQuestions: (filter?: string, page?: number) => Promise<void>;
  searchQuestions: (query: string) => Promise<void>;
  refreshQuestions: () => Promise<void>;
}

const initialState: QuestionsState = {
  questions: [],
  loading: false,
  error: null,
  currentFilter: "newest",
  searchQuery: "",
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 15,
  },
};

export const useQuestionsStore = create<QuestionsStore>()(
  immer((set, get) => ({
    ...initialState,

    // Basic setters
    setQuestions: (questions: Question[]) =>
      set((state) => {
        state.questions = questions;
      }),

    addQuestion: (question: Question) =>
      set((state) => {
        state.questions.unshift(question);
        state.pagination.totalCount += 1;
      }),

    updateQuestion: (questionId: number, updates: Partial<Question>) =>
      set((state) => {
        const index = state.questions.findIndex((q: Question) => q.id === questionId);
        if (index !== -1) {
          Object.assign(state.questions[index], updates);
        }
      }),

    removeQuestion: (questionId: number) =>
      set((state) => {
        state.questions = state.questions.filter((q: Question) => q.id !== questionId);
        state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1);
      }),

    setLoading: (loading: boolean) =>
      set((state) => {
        state.loading = loading;
      }),

    setError: (error: string | null) =>
      set((state) => {
        state.error = error;
      }),

    setFilter: (filter: string) =>
      set((state) => {
        state.currentFilter = filter;
      }),

    setSearchQuery: (query: string) =>
      set((state) => {
        state.searchQuery = query;
      }),

    setPagination: (pagination: Partial<QuestionsState['pagination']>) =>
      set((state) => {
        Object.assign(state.pagination, pagination);
      }),

    // Question interactions
    voteQuestion: (questionId: number, voteType: 'up' | 'down') =>
      set((state) => {
        const question = state.questions.find((q: Question) => q.id === questionId);
        if (question) {
          // In a real app, this would be handled by API
          question.votes = question.votes || 0;
          question.votes += voteType === 'up' ? 1 : -1;
        }
      }),

    bookmarkQuestion: (questionId: number) =>
      set((state) => {
        const question = state.questions.find((q: Question) => q.id === questionId);
        if (question) {
          // Toggle bookmark state
          question.isBookmarked = !question.isBookmarked;
        }
      }),

    watchQuestion: (questionId: number) =>
      set((state) => {
        const question = state.questions.find((q: Question) => q.id === questionId);
        if (question) {
          // Toggle watch state
          question.isWatching = !question.isWatching;
        }
      }),

    // Async actions (placeholder implementations)
    fetchQuestions: async (filter?: string, page: number = 1) => {
      const state = get();
      const targetFilter = filter || state.currentFilter;
      
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        // In a real app, this would be an API call
        // For now, we'll use the existing mock data
        const { mockQuestions } = await import("@/constants/questions");
        
        // Simulate filtering
        let filteredQuestions = [...mockQuestions];
        
        // Apply search filter if exists
        if (state.searchQuery) {
          filteredQuestions = filteredQuestions.filter((q: Question) => 
            q.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            q.tags?.some((tag: string) => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))
          );
        }

        // Apply sorting based on filter
        switch (targetFilter) {
          case "newest":
            // Already sorted by newest in mock data
            break;
          case "active":
            filteredQuestions.sort((a, b) => {
              // Sort by activity (answers, views, votes)
              const activityA = (a.answers || 0) + (a.views || 0) / 100 + (a.votes || 0) * 10;
              const activityB = (b.answers || 0) + (b.views || 0) / 100 + (b.votes || 0) * 10;
              return activityB - activityA;
            });
            break;
          case "unanswered":
            filteredQuestions = filteredQuestions.filter((q: Question) => (q.answers || 0) === 0);
            break;
          case "bountied":
            filteredQuestions = filteredQuestions.filter((q: Question) => q.bountyAmount && q.bountyAmount > 0);
            break;
        }

        // Pagination
        const pageSize = state.pagination.pageSize;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

        set((state) => {
          state.questions = paginatedQuestions;
          state.currentFilter = targetFilter;
          state.loading = false;
          state.pagination = {
            ...state.pagination,
            currentPage: page,
            totalPages: Math.ceil(filteredQuestions.length / pageSize),
            totalCount: filteredQuestions.length,
          };
        });
      } catch (error) {
        set((state) => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : "Failed to fetch questions";
        });
      }
    },

    searchQuestions: async (query: string) => {
      set((state) => {
        state.searchQuery = query;
      });
      
      await get().fetchQuestions(get().currentFilter, 1);
    },

    refreshQuestions: async () => {
      const state = get();
      await get().fetchQuestions(state.currentFilter, state.pagination.currentPage);
    },
  }))
);
