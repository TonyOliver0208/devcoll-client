import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { answersApi, handleAPIError } from '@/lib/api-client'
import { useAuth } from './use-auth'
import { questionKeys } from './use-questions'

// Query keys for cache management
export const answerKeys = {
  all: ['answers'] as const,
  lists: () => [...answerKeys.all, 'list'] as const,
  list: (questionId: string) => [...answerKeys.lists(), questionId] as const,
  details: () => [...answerKeys.all, 'detail'] as const,
  detail: (id: string) => [...answerKeys.details(), id] as const,
  votes: (id: string) => [...answerKeys.all, 'votes', id] as const,
}

// Get all answers for a question
export const useAnswers = (questionId: string) => {
  return useQuery({
    queryKey: answerKeys.list(questionId),
    queryFn: () => answersApi.getAnswers(questionId),
    enabled: !!questionId,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always' as const,
    refetchOnWindowFocus: true,
  })
}

// Get vote counts for an answer
export const useAnswerVotes = (answerId: string) => {
  return useQuery({
    queryKey: answerKeys.votes(answerId),
    queryFn: () => answersApi.getAnswerVotes(answerId),
    enabled: !!answerId,
    staleTime: 0,
    refetchOnMount: 'always' as const,
  })
}

// Create answer mutation
export const useCreateAnswer = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ questionId, content }: { questionId: string; content: string }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return answersApi.createAnswer(questionId, { content })
    },
    onSuccess: async (newAnswer, variables) => {
      console.log('[useCreateAnswer] Answer created, invalidating cache...', newAnswer)
      
      // Invalidate answers list for this question
      await queryClient.invalidateQueries({
        queryKey: answerKeys.list(variables.questionId),
        refetchType: 'active',
      })
      
      // Invalidate the question detail to update answer count
      await queryClient.invalidateQueries({
        queryKey: questionKeys.detail(variables.questionId),
        refetchType: 'active',
      })
      
      console.log('[useCreateAnswer] Cache invalidated successfully')
    },
    onError: (error) => {
      console.error('Answer creation failed:', handleAPIError(error))
    },
  })
}

// Update answer mutation
export const useUpdateAnswer = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ answerId, content, questionId }: { 
      answerId: string; 
      content: string;
      questionId: string;
    }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return answersApi.updateAnswer(answerId, { content })
    },
    onSuccess: async (_, variables) => {
      // Invalidate answers list for the question
      await queryClient.invalidateQueries({
        queryKey: answerKeys.list(variables.questionId),
        refetchType: 'active',
      })
      
      // Invalidate the specific answer detail if we have it cached
      await queryClient.invalidateQueries({
        queryKey: answerKeys.detail(variables.answerId),
        refetchType: 'active',
      })
    },
    onError: (error) => {
      console.error('Answer update failed:', handleAPIError(error))
    },
  })
}

// Delete answer mutation
export const useDeleteAnswer = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ answerId, questionId }: { answerId: string; questionId: string }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return answersApi.deleteAnswer(answerId)
    },
    onSuccess: async (_, variables) => {
      // Invalidate answers list for the question
      await queryClient.invalidateQueries({
        queryKey: answerKeys.list(variables.questionId),
        refetchType: 'active',
      })
      
      // Invalidate the question detail to update answer count
      await queryClient.invalidateQueries({
        queryKey: questionKeys.detail(variables.questionId),
        refetchType: 'active',
      })
    },
    onError: (error) => {
      console.error('Answer deletion failed:', handleAPIError(error))
    },
  })
}

// Vote on answer mutation
export const useVoteAnswer = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ answerId, voteType, questionId }: { 
      answerId: string; 
      voteType: 'up' | 'down';
      questionId: string;
    }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return answersApi.voteAnswer(answerId, voteType)
    },
    onSuccess: async (_, variables) => {
      // Invalidate answers list for the question to update vote counts
      await queryClient.invalidateQueries({
        queryKey: answerKeys.list(variables.questionId),
        refetchType: 'active',
      })
      
      // Invalidate answer votes
      await queryClient.invalidateQueries({
        queryKey: answerKeys.votes(variables.answerId),
        refetchType: 'active',
      })
    },
    onError: (error) => {
      console.error('Answer voting failed:', handleAPIError(error))
    },
  })
}

// Accept answer mutation
export const useAcceptAnswer = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ answerId, questionId }: { answerId: string; questionId: string }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return answersApi.acceptAnswer(answerId)
    },
    onSuccess: async (_, variables) => {
      // Invalidate answers list to update acceptance status
      await queryClient.invalidateQueries({
        queryKey: answerKeys.list(variables.questionId),
        refetchType: 'active',
      })
      
      // Invalidate question detail to show accepted answer badge
      await queryClient.invalidateQueries({
        queryKey: questionKeys.detail(variables.questionId),
        refetchType: 'active',
      })
    },
    onError: (error) => {
      console.error('Answer acceptance failed:', handleAPIError(error))
    },
  })
}
