import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi, handleAPIError } from '@/lib/api-client'
import { useAuth } from './use-auth'
import { questionKeys } from './use-questions'
import { answerKeys } from './use-answers'

// Query keys for cache management
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  questionComments: (postId: string) => [...commentKeys.lists(), 'question', postId] as const,
  answerComments: (answerId: string) => [...commentKeys.lists(), 'answer', answerId] as const,
}

// Get comments for a question (post)
export const useQuestionComments = (postId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: commentKeys.questionComments(postId),
    queryFn: () => commentsApi.getComments(postId, params),
    enabled: !!postId,
    staleTime: 0,
    refetchOnMount: 'always' as const,
    retry: false, // Don't retry on error - just show empty state
  })
}

// Get comments for an answer
export const useAnswerComments = (answerId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: commentKeys.answerComments(answerId),
    queryFn: () => commentsApi.getAnswerComments(answerId, params),
    enabled: !!answerId,
    staleTime: 0,
    refetchOnMount: 'always' as const,
    retry: false, // Don't retry on error - just show empty state
  })
}

// Create comment on a question mutation
export const useCreateQuestionComment = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ postId, content, parentId }: { 
      postId: string; 
      content: string; 
      parentId?: string 
    }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return commentsApi.createComment(postId, { content, parentId })
    },
    onSuccess: async (_, variables) => {
      console.log('[useCreateQuestionComment] Comment created, invalidating cache...')
      
      // Invalidate comments list for this question
      await queryClient.invalidateQueries({
        queryKey: commentKeys.questionComments(variables.postId),
        refetchType: 'active',
      })
      
      // Invalidate the question detail to update comment count
      await queryClient.invalidateQueries({
        queryKey: questionKeys.detail(variables.postId),
        refetchType: 'active',
      })
      
      console.log('[useCreateQuestionComment] Cache invalidated successfully')
    },
    onError: (error) => {
      console.error('Comment creation failed:', handleAPIError(error))
    },
  })
}

// Create comment on an answer mutation
export const useCreateAnswerComment = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ answerId, questionId, content, parentId }: { 
      answerId: string;
      questionId: string;
      content: string; 
      parentId?: string 
    }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return commentsApi.createAnswerComment(answerId, { content, parentId })
    },
    onSuccess: async (_, variables) => {
      console.log('[useCreateAnswerComment] Comment created, invalidating cache...')
      
      // Invalidate comments list for this answer
      await queryClient.invalidateQueries({
        queryKey: commentKeys.answerComments(variables.answerId),
        refetchType: 'active',
      })
      
      // Invalidate answers list to update comment count on the answer
      await queryClient.invalidateQueries({
        queryKey: answerKeys.list(variables.questionId),
        refetchType: 'active',
      })
      
      console.log('[useCreateAnswerComment] Cache invalidated successfully')
    },
    onError: (error) => {
      console.error('Answer comment creation failed:', handleAPIError(error))
    },
  })
}

// Update comment mutation
export const useUpdateComment = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ commentId, content, postId, answerId }: { 
      commentId: string; 
      content: string;
      postId?: string;
      answerId?: string;
    }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return commentsApi.updateComment(commentId, { content })
    },
    onSuccess: async (_, variables) => {
      // Invalidate appropriate comments list
      if (variables.postId) {
        await queryClient.invalidateQueries({
          queryKey: commentKeys.questionComments(variables.postId),
          refetchType: 'active',
        })
      }
      
      if (variables.answerId) {
        await queryClient.invalidateQueries({
          queryKey: commentKeys.answerComments(variables.answerId),
          refetchType: 'active',
        })
      }
    },
    onError: (error) => {
      console.error('Comment update failed:', handleAPIError(error))
    },
  })
}

// Delete comment mutation
export const useDeleteComment = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: ({ commentId, postId, answerId, questionId }: { 
      commentId: string;
      postId?: string;
      answerId?: string;
      questionId?: string;
    }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required')
      }
      return commentsApi.deleteComment(commentId)
    },
    onSuccess: async (_, variables) => {
      // Invalidate appropriate comments list
      if (variables.postId) {
        await queryClient.invalidateQueries({
          queryKey: commentKeys.questionComments(variables.postId),
          refetchType: 'active',
        })
        
        // Update question detail comment count
        await queryClient.invalidateQueries({
          queryKey: questionKeys.detail(variables.postId),
          refetchType: 'active',
        })
      }
      
      if (variables.answerId && variables.questionId) {
        await queryClient.invalidateQueries({
          queryKey: commentKeys.answerComments(variables.answerId),
          refetchType: 'active',
        })
        
        // Update answer comment count in answers list
        await queryClient.invalidateQueries({
          queryKey: answerKeys.list(variables.questionId),
          refetchType: 'active',
        })
      }
    },
    onError: (error) => {
      console.error('Comment deletion failed:', handleAPIError(error))
    },
  })
}
