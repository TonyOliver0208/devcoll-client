"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { UserInteractionsState } from "./types";

interface UserInteractionsStore extends UserInteractionsState {
  // Vote actions
  voteQuestion: (questionId: number, voteType: 'up' | 'down') => void;
  voteAnswer: (answerId: number, voteType: 'up' | 'down') => void;
  removeQuestionVote: (questionId: number) => void;
  removeAnswerVote: (answerId: number) => void;
  
  // Bookmark actions
  bookmarkQuestion: (questionId: number) => void;
  unbookmarkQuestion: (questionId: number) => void;
  bookmarkAnswer: (answerId: number) => void;
  unbookmarkAnswer: (answerId: number) => void;
  
  // Follow/Watch actions
  followTag: (tagName: string) => void;
  unfollowTag: (tagName: string) => void;
  watchQuestion: (questionId: number) => void;
  unwatchQuestion: (questionId: number) => void;
  
  // Getters
  isQuestionVoted: (questionId: number) => 'up' | 'down' | null;
  isAnswerVoted: (answerId: number) => 'up' | 'down' | null;
  isQuestionBookmarked: (questionId: number) => boolean;
  isAnswerBookmarked: (answerId: number) => boolean;
  isTagFollowed: (tagName: string) => boolean;
  isQuestionWatched: (questionId: number) => boolean;
  
  // Bulk actions
  clearAllInteractions: () => void;
}

const initialState: UserInteractionsState = {
  votedQuestions: {},
  votedAnswers: {},
  bookmarkedQuestions: [],
  bookmarkedAnswers: [],
  followedTags: [],
  watchingQuestions: [],
};

export const useUserInteractionsStore = create<UserInteractionsStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Vote actions
      voteQuestion: (questionId: number, voteType: 'up' | 'down') =>
        set((state) => {
          const currentVote = state.votedQuestions[questionId];
          if (currentVote === voteType) {
            // Same vote - remove it
            delete state.votedQuestions[questionId];
          } else {
            // New or different vote
            state.votedQuestions[questionId] = voteType;
          }
        }),

      voteAnswer: (answerId: number, voteType: 'up' | 'down') =>
        set((state) => {
          const currentVote = state.votedAnswers[answerId];
          if (currentVote === voteType) {
            // Same vote - remove it
            delete state.votedAnswers[answerId];
          } else {
            // New or different vote
            state.votedAnswers[answerId] = voteType;
          }
        }),

      removeQuestionVote: (questionId: number) =>
        set((state) => {
          delete state.votedQuestions[questionId];
        }),

      removeAnswerVote: (answerId: number) =>
        set((state) => {
          delete state.votedAnswers[answerId];
        }),

      // Bookmark actions
      bookmarkQuestion: (questionId: number) =>
        set((state) => {
          if (!state.bookmarkedQuestions.includes(questionId)) {
            state.bookmarkedQuestions.push(questionId);
          }
        }),

      unbookmarkQuestion: (questionId: number) =>
        set((state) => {
          state.bookmarkedQuestions = state.bookmarkedQuestions.filter(
            (id: number) => id !== questionId
          );
        }),

      bookmarkAnswer: (answerId: number) =>
        set((state) => {
          if (!state.bookmarkedAnswers.includes(answerId)) {
            state.bookmarkedAnswers.push(answerId);
          }
        }),

      unbookmarkAnswer: (answerId: number) =>
        set((state) => {
          state.bookmarkedAnswers = state.bookmarkedAnswers.filter(
            (id: number) => id !== answerId
          );
        }),

      // Follow/Watch actions
      followTag: (tagName: string) =>
        set((state) => {
          if (!state.followedTags.includes(tagName)) {
            state.followedTags.push(tagName);
          }
        }),

      unfollowTag: (tagName: string) =>
        set((state) => {
          state.followedTags = state.followedTags.filter((tag: string) => tag !== tagName);
        }),

      watchQuestion: (questionId: number) =>
        set((state) => {
          if (!state.watchingQuestions.includes(questionId)) {
            state.watchingQuestions.push(questionId);
          }
        }),

      unwatchQuestion: (questionId: number) =>
        set((state) => {
          state.watchingQuestions = state.watchingQuestions.filter(
            (id: number) => id !== questionId
          );
        }),

      // Getters
      isQuestionVoted: (questionId: number) => {
        return get().votedQuestions[questionId] || null;
      },

      isAnswerVoted: (answerId: number) => {
        return get().votedAnswers[answerId] || null;
      },

      isQuestionBookmarked: (questionId: number) => {
        return get().bookmarkedQuestions.includes(questionId);
      },

      isAnswerBookmarked: (answerId: number) => {
        return get().bookmarkedAnswers.includes(answerId);
      },

      isTagFollowed: (tagName: string) => {
        return get().followedTags.includes(tagName);
      },

      isQuestionWatched: (questionId: number) => {
        return get().watchingQuestions.includes(questionId);
      },

      // Bulk actions
      clearAllInteractions: () =>
        set((state) => {
          Object.assign(state, initialState);
        }),
    })),
    {
      name: "user-interactions-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
