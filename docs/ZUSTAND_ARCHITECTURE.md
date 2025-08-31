# Zustand State Management Architecture

This document describes the comprehensive Zustand-based state management system implemented for the forum features.

## Overview

The application now uses Zustand for centralized state management, following enterprise-grade patterns for scalability and maintainability. The architecture includes:

- **Question Form Store**: Manages question creation, AI analysis, and draft functionality
- **Questions Store**: Handles questions listing, filtering, and user interactions
- **Tags Store**: Manages tags, filtering, and search functionality
- **User Interactions Store**: Tracks votes, bookmarks, followed tags, and watched questions

## Store Architecture

### 1. Question Form Store (`questionFormStore.ts`)

**Purpose**: Manages the complete question creation flow including AI assistance and draft management.

**Key Features**:
- Form data management (title, content, tags)
- AI analysis with character validation (15 chars title, 300 chars content)
- Auto-save draft functionality
- Tag input with space-key addition and AI suggestions
- Form validation with detailed error reporting

**Usage**:
```tsx
import { useQuestionFormStore } from '@/store';

const {
  formData,
  triggerAIAnalysis,
  addTag,
  validateForm,
  autoSave
} = useQuestionFormStore();
```

### 2. Questions Store (`questionsStore.ts`)

**Purpose**: Manages the questions feed, filtering, pagination, and user interactions.

**Key Features**:
- Questions listing with pagination
- Filter management (newest, active, unanswered, bountied)
- Search functionality
- Vote and bookmark tracking
- Loading and error states

**Usage**:
```tsx
import { useQuestionsStore } from '@/store';

const {
  questions,
  loading,
  currentFilter,
  fetchQuestions,
  voteQuestion,
  bookmarkQuestion
} = useQuestionsStore();
```

### 3. Tags Store (`tagsStore.ts`)

**Purpose**: Handles tag management, filtering, and search across the application.

**Key Features**:
- Tags listing and filtering
- Search functionality
- Trending tags calculation
- User tag preferences
- Loading and error states

**Usage**:
```tsx
import { useTagsStore } from '@/store';

const {
  allTags,
  trendingTags,
  fetchTags,
  followTag,
  unfollowTag
} = useTagsStore();
```

### 4. User Interactions Store (`userInteractionsStore.ts`)

**Purpose**: Tracks all user interactions across the platform with persistent storage.

**Key Features**:
- Vote tracking (questions and answers)
- Bookmark management
- Tag following
- Question watching
- Persistent storage via localStorage

**Usage**:
```tsx
import { useUserInteractionsStore } from '@/store';

const {
  voteQuestion,
  bookmarkQuestion,
  isQuestionVoted,
  isQuestionBookmarked
} = useUserInteractionsStore();
```

## Implementation Patterns

### 1. Backward Compatibility

Components maintain backward compatibility during the transition:

```tsx
// Legacy prop support maintained
interface QuestionsContainerProps {
  questions?: Question[]; // Legacy
  // ... other props
}

// Use store or legacy data
const displayQuestions = legacyQuestions || questions;
```

### 2. Auto-Save Drafts

The question form automatically saves drafts with debouncing:

```tsx
const {
  autoSaveEnabled,
  currentDraftId,
  saveDraft,
  loadDraft
} = useQuestionFormStore();

// Auto-saves after 1 second of inactivity
debouncedAutoSave: debounce(() => {
  get().autoSave();
}, 1000)
```

### 3. Character Validation for AI

Implements Stack Overflow-like behavior for AI suggestions:

```tsx
const { canTriggerAI, triggerAIAnalysis } = useQuestionFormStore();

const { canTrigger, missingContent, missingTitle } = canTriggerAI();

if (!canTrigger) {
  // Show character requirement message
  setError(`Please add an extra ${missingContent} characters to start getting tips`);
}
```

### 4. Error Handling

Comprehensive error handling with user-friendly messages:

```tsx
try {
  await fetchQuestions(filter);
} catch (error) {
  set((state) => {
    state.error = error instanceof Error ? error.message : "Failed to fetch questions";
    state.loading = false;
  });
}
```

## Store Features

### Persistence
- **Question Form**: Drafts and auto-save preferences
- **User Interactions**: All user actions (votes, bookmarks, follows)
- **Automatic**: Uses localStorage with JSON serialization

### Performance
- **Immer Integration**: Immutable updates with mutable-style syntax
- **Debounced Operations**: Auto-save, search, and API calls
- **Selective Re-renders**: Only affected components update

### Developer Experience
- **DevTools Integration**: Store debugging in development
- **TypeScript**: Full type safety throughout
- **Error Boundaries**: Graceful error handling

## Migration Guide

### Phase 1: Component Refactoring (Current)
- ✅ QuestionForm migrated to store
- ✅ Add Question page updated
- ✅ QuestionsContainer with backward compatibility
- ✅ TagsContainer with backward compatibility

### Phase 2: Full Integration (Next)
- Update all question pages to use stores directly
- Remove legacy prop passing
- Implement real API integration
- Add optimistic updates

### Phase 3: Advanced Features (Future)
- Real-time updates via WebSocket
- Offline support with sync
- Advanced caching strategies
- Performance optimizations

## Best Practices

### 1. Store Organization
```tsx
// Keep stores focused and single-responsibility
// ✅ Good: Separate stores for different concerns
useQuestionFormStore(); // Form state
useQuestionsStore();    // Questions data
useTagsStore();         // Tags data

// ❌ Avoid: Monolithic store
useAppStore(); // Everything mixed together
```

### 2. State Updates
```tsx
// ✅ Use Immer for clean updates
set((state) => {
  state.formData.title = newTitle;
  state.tags.push(newTag);
});

// ❌ Avoid manual immutability
set((state) => ({
  ...state,
  formData: {
    ...state.formData,
    title: newTitle
  }
}));
```

### 3. Side Effects
```tsx
// ✅ Handle async operations properly
const fetchData = async () => {
  set((state) => { state.loading = true; });
  try {
    const data = await api.getData();
    set((state) => { state.data = data; state.loading = false; });
  } catch (error) {
    set((state) => { state.error = error.message; state.loading = false; });
  }
};
```

## Testing Strategy

### Unit Tests
- Store actions and state updates
- Validation logic
- Error handling

### Integration Tests
- Component + store interactions
- Draft save/load functionality
- AI analysis workflow

### E2E Tests
- Complete question creation flow
- User interaction persistence
- Cross-component state sync

This architecture provides a robust foundation for the forum application with excellent developer experience, type safety, and scalability.
