import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api-client'

// Query keys for cache management
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}

// Get user profile
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false
      }
      return failureCount < 2
    },
  })
}

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: () => {
      // Invalidate profile to refetch
      queryClient.invalidateQueries({ queryKey: authKeys.profile() })
    },
  })
}
