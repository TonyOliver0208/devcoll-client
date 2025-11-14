# Separate Loading States and Error Handling for Voting and Favorites

## Changes Made

### 1. **QuestionDetail Component** (`src/components/questions/QuestionDetail.tsx`)

#### Added State Management
```typescript
const [voteLoading, setVoteLoading] = useState(false);
const [voteError, setVoteError] = useState<string | null>(null);
const [currentVotes, setCurrentVotes] = useState({
  total: question.votes,
  userVote: question.userVote,
  upvotes: 0,
  downvotes: 0,
});
```

#### Optimistic Updates for Voting
- Vote changes are reflected immediately in the UI (optimistic update)
- If API call fails, the vote is reverted
- Prevents double-clicking with loading state check

#### Error Handling
- Catches API errors and displays them in a popup
- Errors auto-dismiss after 5 seconds
- User can manually dismiss errors

### 2. **QuestionSection Component** (`src/components/questions/QuestionSection.tsx`)

#### New Props
```typescript
interface QuestionSectionProps {
  // ... existing props
  voteLoading?: boolean;
  voteError?: string | null;
  onDismissError?: () => void;
}
```

#### Error Popup UI
- Fixed position at top-right of screen
- Red-themed error notification
- Dismissible with X button
- Auto-dismisses after 5 seconds
- Slide-in animation

### 3. **VoteControls Component** (`src/components/questions/VoteControls.tsx`)

#### New Props and State
```typescript
interface VoteControlsProps {
  // ... existing props
  isLoading?: boolean; // Vote loading state
}

// Internal state
const [favoriteLoading, setFavoriteLoading] = useState(false);
const [favoriteError, setFavoriteError] = useState<string | null>(null);
```

#### Vote Buttons Loading State
- Disabled while loading
- Show spinner instead of arrow icon
- Reduced opacity when disabled
- Prevents double-clicking

#### Bookmark Button Loading State
- Shows spinner while saving/removing favorite
- Disabled during operation
- Separate loading state from voting

#### Favorite Error Popup
- Similar to vote error popup
- Shows at top-right (slightly lower than vote errors)
- Auto-dismisses after 5 seconds
- Dismissible manually

## UI/UX Improvements

### Visual Feedback
1. **Immediate Response**: Optimistic updates make the app feel faster
2. **Loading Indicators**: Spinners show when operations are in progress
3. **Error Messages**: Clear, user-friendly error messages
4. **Auto-Dismiss**: Errors don't clutter the UI forever
5. **Disabled States**: Buttons are disabled during operations

### Error Handling
1. **Non-Blocking**: Errors don't prevent using other features
2. **Informative**: Error messages explain what went wrong
3. **Recoverable**: Failed operations revert to previous state
4. **Dismissible**: Users can close error messages manually

### Loading States
1. **Vote Loading**: Shows spinner on the active vote button
2. **Favorite Loading**: Shows spinner on bookmark icon
3. **Independent**: Each feature has its own loading state
4. **Non-Intrusive**: Loading doesn't affect page layout

## Technical Details

### Optimistic Updates Pattern
```typescript
// 1. Save current state
const prevVotes = { ...currentVotes };

// 2. Update UI immediately
setCurrentVotes({ ...newVotes });

try {
  // 3. Make API call
  const result = await api.voteQuestion();
  
  // 4. Update with real data
  setCurrentVotes(result);
} catch (error) {
  // 5. Revert on error
  setCurrentVotes(prevVotes);
  showError(error);
}
```

### Error Popup Positioning
- Vote errors: `top-4 right-4`
- Favorite errors: `top-20 right-4` (lower to avoid overlap)
- Both use `z-50` for proper stacking

### Animation
- Uses Tailwind's `animate-in slide-in-from-top-5`
- Smooth entrance for better UX
- Spinner uses `animate-spin`

## Benefits

### User Experience
✅ **Faster perceived performance** - Optimistic updates
✅ **Clear feedback** - Loading spinners and error messages
✅ **No page reloads** - Everything updates in place
✅ **Graceful degradation** - Errors don't break the app
✅ **Non-blocking** - Can still browse while operations complete

### Developer Experience
✅ **Separated concerns** - Vote and favorite have independent states
✅ **Reusable patterns** - Error handling can be extracted to hooks
✅ **Type-safe** - Full TypeScript support
✅ **Maintainable** - Clear state management

### Performance
✅ **No unnecessary rerenders** - Localized state updates
✅ **Efficient API calls** - Only necessary requests
✅ **Responsive UI** - No blocking operations
✅ **Memory efficient** - Auto-cleanup of error messages

## Future Enhancements

1. **Toast System**: Replace custom popups with a toast library like `sonner`
2. **Retry Logic**: Add automatic retry for failed operations
3. **Offline Support**: Queue operations when offline
4. **Success Messages**: Show success feedback for important actions
5. **Loading Skeleton**: Show skeleton while loading question details
6. **Error Recovery**: Suggest actions when errors occur (e.g., "Try again" button)
7. **Analytics**: Track error rates and loading times
8. **A/B Testing**: Test different loading indicators

## Testing Checklist

### Vote Functionality
- [ ] Upvote works and shows loading state
- [ ] Downvote works and shows loading state
- [ ] Toggle vote works (click same button twice)
- [ ] Switch vote works (up to down or vice versa)
- [ ] Optimistic update shows immediately
- [ ] Error reverts vote to previous state
- [ ] Error popup appears and dismisses
- [ ] Can't double-click during loading
- [ ] Works when authenticated
- [ ] Shows login prompt when not authenticated

### Favorite Functionality
- [ ] Bookmark works and shows loading state
- [ ] Unbookmark works and shows loading state
- [ ] Can toggle multiple times
- [ ] Error popup appears and dismisses
- [ ] Can't double-click during loading
- [ ] Works when authenticated
- [ ] Shows login prompt when not authenticated
- [ ] Favorites appear in profile page

### Error Handling
- [ ] Vote errors show in popup
- [ ] Favorite errors show in popup (lower position)
- [ ] Errors can be dismissed manually
- [ ] Errors auto-dismiss after 5 seconds
- [ ] Multiple errors don't overlap
- [ ] Error messages are user-friendly

### Loading States
- [ ] Vote buttons show spinner when loading
- [ ] Bookmark button shows spinner when loading
- [ ] Buttons are disabled during loading
- [ ] Loading doesn't affect page layout
- [ ] Page remains usable during operations
