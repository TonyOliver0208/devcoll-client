'use client'

import { useQuestions } from '@/hooks/use-questions'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Wifi } from 'lucide-react'
import { getErrorMessage, isNetworkError } from '@/lib/errors'

export default function QuestionsWithQuery() {
  const { 
    data: questions, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuestions()

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  // Error state - React Query handles retries automatically
  if (error) {
    const isOffline = isNetworkError(error)
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          {isOffline ? (
            <Wifi className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          ) : (
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isOffline ? 'Connection Problem' : 'Loading Error'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {getErrorMessage(error)}
          </p>
          
          <Button 
            onClick={() => refetch()} 
            disabled={isRefetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Questions</h2>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {(!questions || !Array.isArray(questions) || questions.length === 0) ? (
        <div className="text-center p-8 text-gray-500">
          No questions found
        </div>
      ) : (
        <div className="space-y-4">
          {(questions as any[])?.map((question: any) => (
            <div key={question.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{question.title}</h3>
              <p className="text-gray-600 mt-2">{question.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
