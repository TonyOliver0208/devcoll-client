import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'inline' | 'page' | 'card'
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'page'
}: LoadingStateProps) {
  const baseClasses = "flex items-center justify-center"
  
  const variantClasses = {
    inline: "gap-2",
    page: "min-h-[400px] flex-col gap-4",
    card: "p-8 flex-col gap-4"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <LoadingSpinner size={size} className="text-blue-600" />
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200"
  
  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-md",
    circular: "rounded-full"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  )
}

// Common skeleton patterns
export function QuestionSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function UserProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-16 w-16" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  )
}
