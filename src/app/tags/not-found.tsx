'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, Hash, ArrowLeft } from 'lucide-react'

export default function TagsNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative">
              <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mb-2">
                404
              </h1>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Hash className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-900">
              Tag Not Found
            </h2>
          </div>
          
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto mb-2">
            The tag you're looking for doesn't exist or may have been removed.
          </p>
          <p className="text-gray-500 text-sm">
            Let's get you back on track and exploring!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-sm mx-auto mb-8">
          <Link href="/tags">
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              size="lg"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse All Tags
            </Button>
          </Link>
          
          <Link href="/">
            <Button 
              variant="outline" 
              className="w-full border-gray-300 hover:bg-gray-50"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-3">Popular Sections:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link 
              href="/questions" 
              className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-sm font-medium text-gray-700"
            >
              Questions
            </Link>
            <Link 
              href="/editor" 
              className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-sm font-medium text-gray-700"
            >
              Create Post
            </Link>
            <Link 
              href="/profile" 
              className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-sm font-medium text-gray-700"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
