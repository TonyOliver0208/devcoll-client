"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { QuestionFormData, AIAssistantState } from "./types";
import { AISuggestion, MockAIService } from "@/services/mockAIService";
import { debounce } from "lodash";

interface DraftData {
  title: string;
  content: any;
  contentHtml: string;
  tags: string[];
  updatedAt?: Date;
}

interface QuestionFormStore extends AIAssistantState {
  // Form Data
  formData: QuestionFormData;
  tagInput: string;
  isSubmitting: boolean;
  
  // Draft Management
  hasDraft: boolean;
  isDraftLoading: boolean;
  isDraftSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaved: number;
  draftError: string | null;
  
  // Form Actions
  setTitle: (title: string) => void;
  setContent: (content: any, html?: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setTagInput: (input: string) => void;
  resetForm: () => void;
  
  // AI Assistant Actions
  triggerAIAnalysis: (title?: string, content?: string) => Promise<void>;
  clearAISuggestions: () => void;
  applyAITag: (tagName: string) => void;
  
  // Draft Actions
  loadDraft: () => Promise<void>;
  saveDraft: () => Promise<void>;
  discardDraft: () => Promise<void>;
  autoSave: () => void;
  debouncedAutoSave: () => void;
  
  // Validation
  validateForm: () => { isValid: boolean; errors: string[] };
  canTriggerAI: () => { canTrigger: boolean; missingContent?: number; missingTitle?: number };
}

const initialFormData: QuestionFormData = {
  title: "",
  content: null,
  contentHtml: "",
  tags: [],
};

const initialAIState: AIAssistantState = {
  isAnalyzing: false,
  suggestions: null,
  error: null,
  lastAnalyzedContent: null,
};

export const useQuestionFormStore = create<QuestionFormStore>()(
  immer((set, get) => ({
    // Initial state
    formData: initialFormData,
    tagInput: "",
    isSubmitting: false,
    hasDraft: false,
    isDraftLoading: false,
    isDraftSaving: false,
    autoSaveEnabled: true,
    lastSaved: Date.now(),
    draftError: null,
    ...initialAIState,

    // Form Actions
    setTitle: (title: string) =>
      set((state) => {
        state.formData.title = title;
        if (state.autoSaveEnabled) {
          get().debouncedAutoSave();
        }
      }),

    setContent: (content: any, html?: string) =>
      set((state) => {
        state.formData.content = content;
        if (html) state.formData.contentHtml = html;
        if (state.autoSaveEnabled) {
          get().debouncedAutoSave();
        }
      }),

    setTags: (tags: string[]) =>
      set((state) => {
        state.formData.tags = tags;
        if (state.autoSaveEnabled) {
          get().debouncedAutoSave();
        }
      }),

    addTag: (tag: string) =>
      set((state) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (
          trimmedTag &&
          !state.formData.tags.includes(trimmedTag) &&
          state.formData.tags.length < 5
        ) {
          state.formData.tags.push(trimmedTag);
          state.tagInput = "";
          if (state.autoSaveEnabled) {
            get().debouncedAutoSave();
          }
        }
      }),

    removeTag: (tagToRemove: string) =>
      set((state) => {
        state.formData.tags = state.formData.tags.filter(
          (tag: string) => tag !== tagToRemove
        );
        if (state.autoSaveEnabled) {
          get().debouncedAutoSave();
        }
      }),

    setTagInput: (input: string) =>
      set((state) => {
        state.tagInput = input;
      }),

    resetForm: () =>
      set((state) => {
        state.formData = { ...initialFormData };
        state.tagInput = "";
        state.hasDraft = false;
        state.isSubmitting = false;
        state.draftError = null;
        // Reset AI state
        Object.assign(state, initialAIState);
      }),

    // AI Assistant Actions
    triggerAIAnalysis: async (title?: string, content?: string) => {
      const state = get();
      const analysisTitle = title || state.formData.title;
      const analysisContent = content || state.formData.contentHtml;

      // Check if we can trigger AI
      const { canTrigger, missingContent, missingTitle } = state.canTriggerAI();

      if (!canTrigger) {
        const errorMessages: string[] = [];
        if (missingTitle && missingTitle > 0) {
          errorMessages.push(`Please add an extra ${missingTitle} characters to your title`);
        }
        if (missingContent && missingContent > 0) {
          errorMessages.push(`Please add an extra ${missingContent} characters to start getting tips`);
        }
        
        set((state) => {
          state.isAnalyzing = false;
          state.error = errorMessages.join(". ");
          state.suggestions = null;
        });
        return;
      }

      set((state) => {
        state.isAnalyzing = true;
        state.error = null;
        state.suggestions = null;
      });

      try {
        const suggestions = await MockAIService.analyzeQuestion(
          analysisTitle,
          analysisContent
        );

        set((state) => {
          state.isAnalyzing = false;
          state.suggestions = suggestions;
          state.lastAnalyzedContent = {
            title: analysisTitle,
            content: analysisContent,
          };
        });
      } catch (error) {
        set((state) => {
          state.isAnalyzing = false;
          state.error = error instanceof Error ? error.message : "Failed to analyze question";
        });
      }
    },

    clearAISuggestions: () =>
      set((state) => {
        Object.assign(state, initialAIState);
      }),

    applyAITag: (tagName: string) => {
      get().addTag(tagName);
    },

    // Server-side Draft Actions
    loadDraft: async () => {
      set((state) => {
        state.isDraftLoading = true;
        state.draftError = null;
      });

      try {
        const response = await fetch('/api/drafts/question', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load draft');
        }

        const result = await response.json();
        
        if (result.data) {
          set((state) => {
            state.formData = {
              title: result.data.title,
              content: result.data.content,
              contentHtml: result.data.contentHtml,
              tags: result.data.tags,
            };
            state.hasDraft = true;
            state.isDraftLoading = false;
            state.lastSaved = new Date(result.data.updatedAt).getTime();
          });
        } else {
          set((state) => {
            state.hasDraft = false;
            state.isDraftLoading = false;
          });
        }
      } catch (error) {
        set((state) => {
          state.isDraftLoading = false;
          state.draftError = error instanceof Error ? error.message : 'Failed to load draft';
        });
      }
    },

    saveDraft: async () => {
      const state = get();
      
      // Don't save if form is empty
      if (!state.formData.title.trim() && !state.formData.contentHtml.trim() && state.formData.tags.length === 0) {
        return;
      }

      set((state) => {
        state.isDraftSaving = true;
        state.draftError = null;
      });

      try {
        const response = await fetch('/api/drafts/question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: state.formData.title,
            content: state.formData.content,
            contentHtml: state.formData.contentHtml,
            tags: state.formData.tags,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save draft');
        }

        const result = await response.json();

        set((state) => {
          state.isDraftSaving = false;
          state.hasDraft = true;
          state.lastSaved = new Date(result.updatedAt).getTime();
        });
      } catch (error) {
        set((state) => {
          state.isDraftSaving = false;
          state.draftError = error instanceof Error ? error.message : 'Failed to save draft';
        });
      }
    },

    discardDraft: async () => {
      set((state) => {
        state.isDraftSaving = true;
        state.draftError = null;
      });

      try {
        const response = await fetch('/api/drafts/question', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to discard draft');
        }

        set((state) => {
          state.formData = { ...initialFormData };
          state.tagInput = "";
          state.hasDraft = false;
          state.isDraftSaving = false;
          state.lastSaved = Date.now();
          // Reset AI state
          Object.assign(state, initialAIState);
        });
      } catch (error) {
        set((state) => {
          state.isDraftSaving = false;
          state.draftError = error instanceof Error ? error.message : 'Failed to discard draft';
        });
      }
    },

    autoSave: () => {
      const state = get();
      if (!state.autoSaveEnabled || state.isDraftSaving) return;

      // Only auto-save if there's actual content
      if (state.formData.title.trim() || state.formData.contentHtml.trim() || state.formData.tags.length > 0) {
        get().saveDraft();
      }
    },

    // Validation
    validateForm: () => {
      const state = get();
      const errors: string[] = [];
      let isValid = true;

      if (!state.formData.title.trim()) {
        errors.push("Title is required");
        isValid = false;
      } else if (state.formData.title.trim().length < 15) {
        errors.push("Title must be at least 15 characters");
        isValid = false;
      }

      if (!state.formData.content) {
        errors.push("Content is required");
        isValid = false;
      } else {
        const contentText = state.formData.contentHtml.replace(/<[^>]*>/g, '').trim();
        if (contentText.length < 30) {
          errors.push("Content must be at least 30 characters");
          isValid = false;
        }
      }

      if (state.formData.tags.length === 0) {
        errors.push("At least one tag is required");
        isValid = false;
      }

      return { isValid, errors };
    },

    canTriggerAI: () => {
      const state = get();
      const titleLength = state.formData.title.trim().length;
      const contentLength = state.formData.contentHtml.replace(/<[^>]*>/g, '').trim().length;

      const minTitleLength = 15;
      const minContentLength = 300;

      const missingTitle = Math.max(0, minTitleLength - titleLength);
      const missingContent = Math.max(0, minContentLength - contentLength);

      return {
        canTrigger: titleLength >= minTitleLength && contentLength >= minContentLength,
        missingContent: missingContent > 0 ? missingContent : undefined,
        missingTitle: missingTitle > 0 ? missingTitle : undefined,
      };
    },

    // Debounced auto-save
    debouncedAutoSave: debounce(() => {
      get().autoSave();
    }, 1000),
  }))
);
