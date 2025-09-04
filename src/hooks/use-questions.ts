import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi } from '@/lib/api-client'

// Query keys for cache management
export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filters: string) => [...questionKeys.lists(), { filters }] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
}

// Get all questions with filters
export const useQuestions = (params?: any, options?: any) => {
  return useQuery({
    queryKey: questionKeys.list(JSON.stringify(params)),
    queryFn: () => questionsApi.getQuestions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  
  return useMutation({
    mutationFn: (data: any) => questionsApi.createQuestion(data),
    onSuccess: () => {
      // Invalidate questions list to refetch
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() })
    },
  })
}

// Update question mutation
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      questionsApi.updateQuestion(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific question and list
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() })
    },
  })
}

// Delete question mutation
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => questionsApi.deleteQuestion(id),
    onSuccess: () => {
      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() })
    },
  })
}
