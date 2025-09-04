"use client";

import React, { useCallback } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useSession } from "next-auth/react";
import { savedItemsService } from "@/services/savedItems";
import type { SavedItem, SavedList } from "@/services/savedItems";

// Store types
interface SavedItemsState {
  // State
  savedItems: Record<string, SavedItem>;
  savedLists: Record<string, SavedList>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSavedLists: () => Promise<void>;
  loadListItems: (listId: string) => Promise<void>;
  saveItem: (itemData: any, listId?: string) => Promise<void>;
  unsaveItem: (itemId: string) => Promise<void>;
  createList: (name: string, description?: string) => Promise<string>;
  deleteList: (listId: string) => Promise<void>;
  moveItemToList: (itemId: string, fromListId: string, toListId: string) => Promise<void>;
  
  // Getters
  getItemsByList: (listId: string) => SavedItem[];
  getAllSavedItems: () => SavedItem[];
  getSavedItemsCount: () => number;
  isItemSaved: (itemId: string) => boolean;
  getListByName: (name: string) => SavedList | undefined;
  
  // Reset
  clearStore: () => void;
}

export const useSavedItemsStore = create<SavedItemsState>()(
  immer((set, get) => ({
    // Initial state
    savedItems: {},
    savedLists: {},
    isLoading: false,
    error: null,

    // Load all saved lists for current user
    loadSavedLists: async () => {
      // TODO: Enable API calls when backend is ready
      console.warn("Load saved lists functionality disabled - backend not available");
      return;
      
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const lists = await savedItemsService.getSavedLists();
        
        set((state) => {
          state.savedLists = {};
          lists.forEach((list: SavedList) => {
            state.savedLists[list.id] = list;
          });
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to load lists';
          state.isLoading = false;
        });
      }
    },

    // Load items for a specific list
    loadListItems: async (listId: string) => {
      // TODO: Enable API calls when backend is ready
      console.warn("Load list items functionality disabled - backend not available");
      return;
      
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const items = await savedItemsService.getListItems(listId);
        
        set((state) => {
          items.forEach((item: SavedItem) => {
            state.savedItems[item.id] = item;
          });
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to load items';
          state.isLoading = false;
        });
      }
    },

    // Save an item to a list
    saveItem: async (itemData: any, listId?: string) => {
      // TODO: Enable API calls when backend is ready
      console.warn("Save item functionality disabled - backend not available");
      return;
      
      const targetListId = listId || "for-later";
      
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const savedItem = await savedItemsService.saveItem({
          itemType: itemData.type || 'question',
          itemId: itemData.itemId || itemData.id,
          listId: targetListId,
          title: itemData.title,
          content: itemData.content,
          tags: itemData.tags || [],
          votes: itemData.votes || 0,
          views: itemData.views || '0',
          answers: itemData.answers || 0,
          author: {
            id: itemData.author?.id || 'unknown',
            name: itemData.author?.name || 'Anonymous',
            reputation: itemData.author?.reputation || '0',
            avatar: itemData.author?.avatar,
          },
          url: itemData.url || '#',
        });

        set((state) => {
          state.savedItems[savedItem.id] = savedItem;
          // Update list item count if list is loaded
          if (state.savedLists[targetListId]) {
            state.savedLists[targetListId].itemCount++;
          }
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to save item';
          state.isLoading = false;
        });
      }
    },

    // Remove an item from saved items
    unsaveItem: async (itemId: string) => {
      // TODO: Enable API calls when backend is ready
      console.warn("Unsave item functionality disabled - backend not available");
      return;
      
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await savedItemsService.removeItem(itemId);
        
        set((state) => {
          const item = state.savedItems[itemId];
          if (item && state.savedLists[item.listId]) {
            state.savedLists[item.listId].itemCount--;
          }
          delete state.savedItems[itemId];
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to remove item';
          state.isLoading = false;
        });
      }
    },

    // Create a new list
    createList: async (name: string, description = "") => {
      // TODO: Enable API calls when backend is ready
      console.warn("Create list functionality disabled - backend not available");
      return "mock-id";
      
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const newList = await savedItemsService.createList({ name, description });
        
        set((state) => {
          state.savedLists[newList.id] = newList;
          state.isLoading = false;
        });

        return newList.id;
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to create list';
          state.isLoading = false;
        });
        throw error;
      }
    },

    // Delete a list
    deleteList: async (listId: string) => {
      // TODO: Enable API calls when backend is ready
      console.warn("Delete list functionality disabled - backend not available");
      return;
      
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await savedItemsService.deleteList(listId);
        
        set((state) => {
          // Remove items that belonged to this list
          Object.keys(state.savedItems).forEach((itemId) => {
            if (state.savedItems[itemId].listId === listId) {
              delete state.savedItems[itemId];
            }
          });
          // Remove the list
          delete state.savedLists[listId];
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to delete list';
          state.isLoading = false;
        });
      }
    },

    // Move item between lists
    moveItemToList: async (itemId: string, fromListId: string, toListId: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await savedItemsService.moveItem(itemId, toListId);
        
        set((state) => {
          if (state.savedItems[itemId]) {
            state.savedItems[itemId].listId = toListId;
          }
          // Update list counts
          if (state.savedLists[fromListId]) {
            state.savedLists[fromListId].itemCount--;
          }
          if (state.savedLists[toListId]) {
            state.savedLists[toListId].itemCount++;
          }
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to move item';
          state.isLoading = false;
        });
      }
    },

    // Getters
    getItemsByList: (listId: string) => {
      const state = get();
      return Object.values(state.savedItems).filter(
        (item) => item.listId === listId
      );
    },

    getAllSavedItems: () => {
      const state = get();
      return Object.values(state.savedItems);
    },

    getSavedItemsCount: () => {
      const state = get();
      return Object.keys(state.savedItems).length;
    },

    isItemSaved: (itemId: string) => {
      const state = get();
      return Object.values(state.savedItems).some(
        (item) => item.itemId === itemId
      );
    },

    getListByName: (name: string) => {
      const state = get();
      return Object.values(state.savedLists).find((list) => list.name === name);
    },

    // Clear store (for logout)
    clearStore: () => {
      set((state) => {
        state.savedItems = {};
        state.savedLists = {};
        state.isLoading = false;
        state.error = null;
      });
    },
  }))
);

// Hook to use saved items in components with authentication
export const useSavedItems = () => {
  const { data: session, status } = useSession();
  const store = useSavedItemsStore();
  
  // Auto-load data when user is authenticated
  React.useEffect(() => {
    if (session?.user?.id && Object.keys(store.savedLists).length === 0) {
      store.loadSavedLists();
    }
  }, [session?.user?.id, store]);

  // Return authenticated store or mock store for unauthenticated users
  if (!session && status !== 'loading') {
    return {
      savedItems: {},
      savedLists: {},
      isLoading: false,
      error: null,
      loadSavedLists: async () => {},
      loadListItems: async () => {},
      saveItem: async () => console.warn("Cannot save items without authentication"),
      unsaveItem: async () => console.warn("Cannot unsave items without authentication"),
      createList: async () => { throw new Error("Authentication required"); },
      deleteList: async () => {},
      moveItemToList: async () => {},
      getItemsByList: () => [],
      getAllSavedItems: () => [],
      getSavedItemsCount: () => 0,
      isItemSaved: () => false,
      getListByName: () => undefined,
      clearStore: () => {},
      
      // Helper functions
      saveQuestion: async () => console.warn("Cannot save items without authentication"),
      saveAnswer: async () => console.warn("Cannot save items without authentication"),
    };
  }
  
  return {
    ...store,
    // Helper functions
    saveQuestion: async (question: any, listName = "For later") => {
      if (!session) {
        console.warn("Cannot save items without authentication");
        return;
      }
      
      const list = store.getListByName(listName);
      const listId = list?.id || "for-later";
      
      await store.saveItem({
        type: "question",
        itemId: question.id,
        title: question.title,
        content: question.content,
        tags: question.tags || [],
        votes: question.votes || 0,
        views: question.views || "0",
        answers: question.answers || 0,
        author: {
          id: question.author?.id || 'unknown',
          name: question.author?.name || "Anonymous",
          reputation: question.author?.reputation || "0",
          avatar: question.author?.avatar,
        },
        url: `/questions/${question.id}` || "#",
      }, listId);
    },
    
    saveAnswer: async (answer: any, listName = "For later") => {
      if (!session) {
        console.warn("Cannot save items without authentication");
        return;
      }
      
      const list = store.getListByName(listName);
      const listId = list?.id || "for-later";
      
      await store.saveItem({
        type: "answer",
        itemId: answer.id,
        title: answer.title || `Answer to: ${answer.questionTitle}`,
        content: answer.content,
        tags: answer.tags || [],
        votes: answer.votes || 0,
        views: answer.views || "0", 
        answers: 1,
        author: {
          id: answer.author?.id || 'unknown',
          name: answer.author?.name || "Anonymous",
          reputation: answer.author?.reputation || "0",
          avatar: answer.author?.avatar,
        },
        url: `/questions/${answer.questionId}#answer-${answer.id}` || "#",
      }, listId);
    },
  };
};