import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '@/lib/api-client'

// Query keys for cache management
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
}

// Get all tags
export const useTags = (options?: any) => {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: () => tagsApi.getTags(),
    staleTime: 10 * 60 * 1000, // 10 minutes - tags don't change often
    ...options, // Allow additional query options
  })
}

// Get popular tags
export const usePopularTags = (limit = 5) => {
  return useQuery({
    queryKey: [...tagKeys.all, 'popular', limit] as const,
    queryFn: () => tagsApi.getPopularTags(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get posts by tag name
export const usePostsByTag = (tagName: string, options?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [...tagKeys.all, 'posts', tagName, options?.page, options?.limit] as const,
    queryFn: () => tagsApi.getPostsByTag(tagName, options),
    enabled: !!tagName,
    staleTime: 0, // Always consider data stale - fetch fresh data on every mount
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    refetchOnMount: 'always' as const, // Always refetch when component mounts
  })
}
