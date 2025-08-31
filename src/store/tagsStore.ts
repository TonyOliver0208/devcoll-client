"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Tag } from "@/types/tag";
import { TagsState } from "./types";

interface TagsStore extends TagsState {
  // Actions
  setTags: (tags: Tag[]) => void;
  setTrendingTags: (tags: Tag[]) => void;
  setUserTags: (tags: string[]) => void;
  setSuggestedTags: (tags: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Tag interactions
  followTag: (tagName: string) => void;
  unfollowTag: (tagName: string) => void;
  addToUserTags: (tagName: string) => void;
  removeFromUserTags: (tagName: string) => void;
  
  // Fetching actions
  fetchTags: (filter?: string) => Promise<void>;
  searchTags: (query: string) => Promise<void>;
  refreshTags: () => Promise<void>;
}

const initialState: TagsState = {
  allTags: [],
  trendingTags: [],
  userTags: [],
  suggestedTags: [],
  loading: false,
  error: null,
  currentFilter: "popular",
  searchQuery: "",
};

export const useTagsStore = create<TagsStore>()(
  immer((set, get) => ({
    ...initialState,

    // Basic setters
    setTags: (tags: Tag[]) =>
      set((state) => {
        state.allTags = tags;
      }),

    setTrendingTags: (tags: Tag[]) =>
      set((state) => {
        state.trendingTags = tags;
      }),

    setUserTags: (tags: string[]) =>
      set((state) => {
        state.userTags = tags;
      }),

    setSuggestedTags: (tags: string[]) =>
      set((state) => {
        state.suggestedTags = tags;
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

    // Tag interactions
    followTag: (tagName: string) =>
      set((state) => {
        if (!state.userTags.includes(tagName)) {
          state.userTags.push(tagName);
        }
      }),

    unfollowTag: (tagName: string) =>
      set((state) => {
        state.userTags = state.userTags.filter((tag: string) => tag !== tagName);
      }),

    addToUserTags: (tagName: string) =>
      set((state) => {
        if (!state.userTags.includes(tagName)) {
          state.userTags.push(tagName);
        }
      }),

    removeFromUserTags: (tagName: string) =>
      set((state) => {
        state.userTags = state.userTags.filter((tag: string) => tag !== tagName);
      }),

    // Async actions
    fetchTags: async (filter?: string) => {
      const state = get();
      const targetFilter = filter || state.currentFilter;
      
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const { mockTags } = await import("@/constants/tags");
        
        let filteredTags = [...mockTags];
        
        // Apply search filter
        if (state.searchQuery) {
          filteredTags = filteredTags.filter((tag: Tag) => 
            tag.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            tag.description.toLowerCase().includes(state.searchQuery.toLowerCase())
          );
        }

        // Apply sorting based on filter
        switch (targetFilter) {
          case "popular":
            filteredTags.sort((a, b) => b.questionsCount - a.questionsCount);
            break;
          case "name":
            filteredTags.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case "new":
            filteredTags.sort((a, b) => b.askedThisWeek - a.askedThisWeek);
            break;
        }

        // Get trending tags (top 10 by weekly activity)
        const trendingTags = [...mockTags]
          .sort((a, b) => b.askedThisWeek - a.askedThisWeek)
          .slice(0, 10);

        set((state) => {
          state.allTags = filteredTags;
          state.trendingTags = trendingTags;
          state.currentFilter = targetFilter;
          state.loading = false;
        });
      } catch (error) {
        set((state) => {
          state.loading = false;
          state.error = error instanceof Error ? error.message : "Failed to fetch tags";
        });
      }
    },

    searchTags: async (query: string) => {
      set((state) => {
        state.searchQuery = query;
      });
      
      await get().fetchTags(get().currentFilter);
    },

    refreshTags: async () => {
      await get().fetchTags(get().currentFilter);
    },
  }))
);
