'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, ArrowLeft, Hash } from 'lucide-react'
import Link from 'next/link'

export default function TagsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Tags Error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          {/* Animated Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-orange-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-4 shadow-lg">
              <Hash className="h-12 w-12 text-orange-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Oops! Tags Won't Load
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-2">
            Something went sideways while fetching the tags.
          </p>
          <p className="text-gray-500 text-sm">
            Don't worry, this happens sometimes. Let's give it another shot!
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={reset}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Link href="/" className="block">
            <Button 
              variant="outline" 
              className="w-full border-gray-300 hover:bg-gray-50"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="pt-4 space-y-2">
            <p className="text-gray-500 text-sm">Or explore other sections:</p>
            <div className="flex gap-2 justify-center">
              <Link 
                href="/questions" 
                className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline"
              >
                Browse Questions
              </Link>
              <span className="text-gray-300">•</span>
              <Link 
                href="/editor" 
                className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline"
              >
                Create Post
              </Link>
            </div>
          </div>
        </div>

        {error.digest && (
          <div className="mt-8 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500 font-mono">
              Error ID: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
