'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function QuestionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Questions Error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertCircle className="mx-auto h-16 w-16 text-orange-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Questions Loading Error
          </h1>
          <p className="text-gray-600 mb-4">
            We're having trouble loading the questions. This might be a temporary network issue.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={reset}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Loading Questions
          </Button>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Link 
            href="/questions/add" 
            className="block text-orange-600 hover:text-orange-800 text-sm"
          >
            Or ask a new question
          </Link>
        </div>
      </div>
    </div>
  )
}
