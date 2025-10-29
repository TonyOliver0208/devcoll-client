import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { authApi, handleAPIError } from '@/lib/api-client'

// Query keys for cache management
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  users: () => [...authKeys.all, 'users'] as const,
  topUsers: (limit?: number) => [...authKeys.users(), 'top', limit] as const,
}

// Enhanced authentication hook with OAuth integration
export const useAuth = () => {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    session,
  }
}

// Note: No session syncing needed with stateless JWT authentication
// NextAuth handles JWT tokens automatically - just use them for API calls

// Get user profile
export const useProfile = () => {
  const { isAuthenticated } = useAuth()
  
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    enabled: isAuthenticated,
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

// Get users list with pagination
export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: [...authKeys.users(), params],
    queryFn: () => authApi.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get top users by reputation
export const useTopUsers = (limit = 10) => {
  return useQuery({
    queryKey: authKeys.topUsers(limit),
    queryFn: () => authApi.getTopUsers(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get user by ID
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: [...authKeys.users(), userId],
    queryFn: () => authApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      name?: string;
      username?: string;
      bio?: string;
      picture?: string;
      preferences?: any;
      profile?: any;
    }) => authApi.updateProfile(data),
    onSuccess: (data) => {
      // Update profile cache
      queryClient.setQueryData(authKeys.profile(), data)
    },
    onError: (error) => {
      console.error('Profile update failed:', handleAPIError(error))
    },
  })
}

// Utility to invalidate all auth-related queries
export const useInvalidateAuth = () => {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: authKeys.all })
  }
}
