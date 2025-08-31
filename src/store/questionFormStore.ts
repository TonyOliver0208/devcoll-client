"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { QuestionFormData, QuestionDraft, AIAssistantState } from "./types";
import { AISuggestion, MockAIService } from "@/services/mockAIService";
import { debounce } from "lodash";

interface QuestionFormStore extends AIAssistantState {
  // Form Data
  formData: QuestionFormData;
  tagInput: string;
  isSubmitting: boolean;
  
  // Draft Management
  currentDraftId: string | null;
  drafts: Record<string, QuestionDraft>;
  autoSaveEnabled: boolean;
  lastSaved: number;
  
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
  createDraft: () => string;
  saveDraft: (draftId?: string) => void;
  loadDraft: (draftId: string) => void;
  deleteDraft: (draftId: string) => void;
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
  persist(
    immer((set, get) => ({
      // Initial state
      formData: initialFormData,
      tagInput: "",
      isSubmitting: false,
      currentDraftId: null,
      drafts: {},
      autoSaveEnabled: true,
      lastSaved: Date.now(),
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
          state.currentDraftId = null;
          state.isSubmitting = false;
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

      // Draft Actions
      createDraft: () => {
        const draftId = `draft-${Date.now()}`;
        const state = get();
        
        set((stateDraft) => {
          stateDraft.currentDraftId = draftId;
          stateDraft.drafts[draftId] = {
            id: draftId,
            ...state.formData,
            lastModified: Date.now(),
            isAutoSaved: false,
          };
        });
        
        return draftId;
      },

      saveDraft: (draftId?: string) => {
        const state = get();
        const targetDraftId = draftId || state.currentDraftId;
        
        if (!targetDraftId) return;

        set((stateDraft) => {
          stateDraft.drafts[targetDraftId] = {
            id: targetDraftId,
            ...state.formData,
            lastModified: Date.now(),
            isAutoSaved: true,
          };
          stateDraft.lastSaved = Date.now();
        });
      },

      loadDraft: (draftId: string) => {
        const state = get();
        const draft = state.drafts[draftId];
        
        if (!draft) return;

        set((stateDraft) => {
          stateDraft.formData = {
            title: draft.title,
            content: draft.content,
            contentHtml: draft.contentHtml,
            tags: [...draft.tags],
          };
          stateDraft.currentDraftId = draftId;
          stateDraft.tagInput = "";
        });
      },

      deleteDraft: (draftId: string) =>
        set((state) => {
          delete state.drafts[draftId];
          if (state.currentDraftId === draftId) {
            state.currentDraftId = null;
          }
        }),

      autoSave: () => {
        const state = get();
        if (!state.autoSaveEnabled) return;

        if (!state.currentDraftId) {
          // Create new draft if none exists
          const draftId = get().createDraft();
          get().saveDraft(draftId);
        } else {
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
    })),
    {
      name: "question-form-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        drafts: state.drafts,
        autoSaveEnabled: state.autoSaveEnabled,
      }),
    }
  )
);
