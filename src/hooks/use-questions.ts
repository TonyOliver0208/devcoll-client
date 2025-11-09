import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi, handleAPIError } from '@/lib/api-client'
import { useAuth } from './use-auth'
import { tagKeys } from './use-tags'

// Query keys for cache management
export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filters: any) => [...questionKeys.lists(), { filters }] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
}

// Get all questions with filters and pagination
export const useQuestions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}, options?: any) => {
  return useQuery({
    queryKey: questionKeys.list(params),
    queryFn: () => questionsApi.getQuestions(params),
    staleTime: 0, // Always consider data stale for immediate updates
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    refetchOnMount: 'always' as const, // Always refetch when component mounts
    ...options, // Allow additional query options
  })
}

// Get single question
export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: () => questionsApi.getQuestion(id),
    enabled: !!id, // Only run if ID exists
  })
}

// Create question mutation
export const useCreateQuestion = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      tags: string[];
    }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return questionsApi.createQuestion(data)
    },
    onSuccess: async (newQuestion, variables) => {
      console.log('[useCreateQuestion] Question created, invalidating cache...', newQuestion)
      
      // Invalidate and refetch questions list immediately
      // Use Promise.all to wait for all invalidations to complete
      const invalidations = [
        queryClient.invalidateQueries({ 
          queryKey: questionKeys.lists(),
          refetchType: 'all', // Refetch ALL queries, not just active ones
        }),
        queryClient.invalidateQueries({
          queryKey: questionKeys.all, // Invalidate all question-related queries
          refetchType: 'all',
        })
      ];
      
      // Invalidate tag-based queries for all tags in the new question
      // This ensures that if you're viewing a tag page, it updates immediately
      if (variables.tags && variables.tags.length > 0) {
        console.log('[useCreateQuestion] Invalidating tag queries for:', variables.tags)
        
        // Invalidate all tag posts queries (this will refetch any active tag pages)
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: [...tagKeys.all, 'posts'],
            refetchType: 'all', // Refetch all tag queries
          })
        );
        
        // Also invalidate popular tags in case the new question affects tag counts
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: [...tagKeys.all, 'popular'],
            refetchType: 'all',
          })
        );
        
        // Invalidate tags list
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: tagKeys.all,
            refetchType: 'all',
          })
        );
      }
      
      // Wait for all invalidations to complete
      await Promise.all(invalidations);
      
      console.log('[useCreateQuestion] Cache invalidated and refetched successfully')
    },
    onError: (error) => {
      console.error('Question creation failed:', handleAPIError(error))
    },
  })
}

// Update question mutation
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        title?: string;
        content?: string;
        tags?: string[];
      }
    }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return questionsApi.updateQuestion(id, data)
    },
    onSuccess: (_, { id }) => {
      // Invalidate specific question and list
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() })
    },
    onError: (error) => {
      console.error('Question update failed:', handleAPIError(error))
    },
  })
}

// Delete question mutation
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: (id: string) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return questionsApi.deleteQuestion(id)
    },
    onSuccess: () => {
      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() })
    },
    onError: (error) => {
      console.error('Question deletion failed:', handleAPIError(error))
    },
  })
}

// Vote on question mutation
export const useVoteQuestion = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ id, voteType }: { id: string; voteType: 'up' | 'down' }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return questionsApi.voteQuestion(id, voteType)
    },
    onSuccess: (_, { id }) => {
      // Invalidate specific question to refetch vote counts
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() })
    },
    onError: (error) => {
      console.error('Question voting failed:', handleAPIError(error))
    },
  })
}
