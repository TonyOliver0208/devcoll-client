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
export const useTags = () => {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: () => tagsApi.getTags(),
    staleTime: 10 * 60 * 1000, // 10 minutes - tags don't change often
  })
}

// Get single tag
export const useTag = (id: string) => {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => tagsApi.getTag(id),
    enabled: !!id,
  })
}
