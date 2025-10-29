import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchApi, handleAPIError } from '@/lib/api-client'
import { useAuth } from './use-auth'
import { useDebouncedValue } from './use-debounced-value'

// Query keys for cache management
export const searchKeys = {
  all: ['search'] as const,
  searches: () => [...searchKeys.all, 'searches'] as const,
  search: (query: string, filters?: any) => [...searchKeys.searches(), { query, filters }] as const,
  suggestions: () => [...searchKeys.all, 'suggestions'] as const,
  suggestion: (query: string) => [...searchKeys.suggestions(), query] as const,
}

// Main search hook with debounced query
export const useSearch = (
  query: string,
  filters?: {
    type?: 'questions' | 'users' | 'all';
    tags?: string[];
    dateRange?: string;
  },
  options?: {
    enabled?: boolean;
    debounceMs?: number;
  }
) => {
  // Debounce the search query to avoid too many API calls
  const debouncedQuery = useDebouncedValue(query, options?.debounceMs || 300)
  
  return useQuery({
    queryKey: searchKeys.search(debouncedQuery, filters),
    queryFn: () => searchApi.search(debouncedQuery, filters),
    enabled: (options?.enabled !== false) && debouncedQuery.length >= 2, // Minimum 2 chars
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
  })
}

// Search suggestions hook for autocomplete
export const useSearchSuggestions = (
  query: string,
  options?: {
    enabled?: boolean;
    debounceMs?: number;
  }
) => {
  const debouncedQuery = useDebouncedValue(query, options?.debounceMs || 200)
  
  return useQuery({
    queryKey: searchKeys.suggestion(debouncedQuery),
    queryFn: () => searchApi.getSearchSuggestions(debouncedQuery),
    enabled: (options?.enabled !== false) && debouncedQuery.length >= 1, // Minimum 1 char for suggestions
    staleTime: 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  })
}

// Hook for immediate search (without debouncing) - useful for programmatic searches
export const useImmediateSearch = (
  query: string,
  filters?: {
    type?: 'questions' | 'users' | 'all';
    tags?: string[];
    dateRange?: string;
  }
) => {
  return useQuery({
    queryKey: searchKeys.search(query, filters),
    queryFn: () => searchApi.search(query, filters),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook for search history management (client-side)
export const useSearchHistory = () => {
  const STORAGE_KEY = 'search_history'
  const MAX_HISTORY = 10

  const getSearchHistory = (): string[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const history = localStorage.getItem(STORAGE_KEY)
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  }

  const addToSearchHistory = (query: string) => {
    if (typeof window === 'undefined' || !query.trim()) return
    
    try {
      const history = getSearchHistory()
      const newHistory = [
        query.trim(),
        ...history.filter(item => item !== query.trim())
      ].slice(0, MAX_HISTORY)
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  }

  const clearSearchHistory = () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }

  return {
    getSearchHistory,
    addToSearchHistory,
    clearSearchHistory
  }
}

// Search analytics hook (for tracking popular searches)
export const useSearchAnalytics = () => {
  const { isAuthenticated } = useAuth()
  
  const trackSearch = useMutation({
    mutationFn: async ({ query, resultCount }: { query: string; resultCount: number }) => {
      // This would typically send analytics data to the backend
      // For now, we'll just log it
      console.log('[Search Analytics]', {
        query,
        resultCount,
        timestamp: new Date().toISOString(),
        authenticated: isAuthenticated
      })
      
      // Could extend this to call an analytics API
      // return analyticsApi.trackSearch({ query, resultCount })
    },
    onError: (error) => {
      console.error('Search tracking failed:', handleAPIError(error))
    },
  })

  return {
    trackSearch: trackSearch.mutate,
    isTracking: trackSearch.isPending
  }
}

// Combined search hook with all features
export const useEnhancedSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<{
    type?: 'questions' | 'users' | 'all';
    tags?: string[];
    dateRange?: string;
  }>({})
  
  const { addToSearchHistory, getSearchHistory } = useSearchHistory()
  const { trackSearch } = useSearchAnalytics()
  
  // Main search
  const searchResult = useSearch(query, filters)
  
  // Suggestions for autocomplete
  const suggestionsResult = useSearchSuggestions(query, {
    enabled: query.length > 0 && query.length < 3 // Only show suggestions for short queries
  })
  
  const performSearch = useCallback((searchQuery: string, searchFilters = filters) => {
    setQuery(searchQuery)
    setFilters(searchFilters)
    
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim())
      
      // Track search after results are available
      if (searchResult.data) {
        trackSearch({
          query: searchQuery,
          resultCount: Array.isArray(searchResult.data) ? searchResult.data.length : 0
        })
      }
    }
  }, [filters, addToSearchHistory, trackSearch, searchResult.data])
  
  return {
    // Search state
    query,
    filters,
    setQuery,
    setFilters,
    performSearch,
    
    // Search results
    results: searchResult.data,
    isSearching: searchResult.isFetching,
    searchError: searchResult.error,
    
    // Suggestions
    suggestions: suggestionsResult.data,
    isFetchingSuggestions: suggestionsResult.isFetching,
    suggestionsError: suggestionsResult.error,
    
    // History
    searchHistory: getSearchHistory(),
  }
}