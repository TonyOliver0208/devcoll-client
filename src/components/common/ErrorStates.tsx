import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface NetworkErrorProps {
  onRetry?: () => void
  message?: string
  showRetry?: boolean
}

export function NetworkError({ 
  onRetry, 
  message = "Unable to connect to our servers. Please check your internet connection and try again.",
  showRetry = true 
}: NetworkErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <WifiOff className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Connection Problem
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {message}
      </p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}

interface LoadingErrorProps {
  onRetry?: () => void
  title?: string
  description?: string
  variant?: 'default' | 'compact'
}

export function LoadingError({ 
  onRetry, 
  title = "Loading Error",
  description = "Something went wrong while loading this content.",
  variant = 'default'
}: LoadingErrorProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <div>
            <p className="text-sm font-medium text-red-800">{title}</p>
            <p className="text-sm text-red-600">{description}</p>
          </div>
        </div>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="bg-red-600 hover:bg-red-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    href: string
  }
}

export function EmptyState({ 
  icon: Icon = AlertCircle,
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Icon className="h-16 w-16 text-gray-400 mb-6" />
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-8 max-w-md">
        {description}
      </p>
      <div className="space-y-3">
        {action && (
          <Button onClick={action.onClick} className="bg-blue-600 hover:bg-blue-700">
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <a 
            href={secondaryAction.href}
            className="block text-blue-600 hover:text-blue-800 text-sm"
          >
            {secondaryAction.label}
          </a>
        )}
      </div>
    </div>
  )
}
