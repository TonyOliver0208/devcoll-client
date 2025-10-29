import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi, handleAPIError } from '@/lib/api-client'
import { useAuth } from './use-auth'

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
    staleTime: 2 * 60 * 1000, // 2 minutes
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
    onSuccess: () => {
      // Invalidate questions list to refetch
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() })
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
