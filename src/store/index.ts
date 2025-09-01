// Main store exports
export { useQuestionFormStore } from './questionFormStore';
export { useQuestionsStore } from './questionsStore';
export { useTagsStore } from './tagsStore';
export { useUserInteractionsStore } from './userInteractionsStore';
export { useSavedItemsStore, useSavedItems } from './savedItemsStore';

// Store types
export type {
  QuestionFormData,
  QuestionDraft,
  AIAssistantState,
  QuestionsState,
  TagsState,
  UserInteractionsState,
  DraftState
} from './types';

export type {
  SavedItem,
  SavedList
} from './savedItemsStore';

// Store utilities and helpers
export const storeUtils = {
  // Clear all stores (useful for logout)
  clearAllStores: () => {
    // Import stores dynamically to avoid circular dependencies
    import('./questionFormStore').then(({ useQuestionFormStore }) => {
      useQuestionFormStore.getState().resetForm();
    });
    
    import('./userInteractionsStore').then(({ useUserInteractionsStore }) => {
      useUserInteractionsStore.getState().clearAllInteractions();
    });
  },
};
