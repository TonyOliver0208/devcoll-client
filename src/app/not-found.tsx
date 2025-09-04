import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <FileQuestion className="mx-auto h-20 w-20 text-gray-400 mb-6" />
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. 
            The page may have been moved, deleted, or you may have mistyped the URL.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Link href="/questions">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Browse Questions
              </Button>
            </Link>
          </div>
          
          <div className="flex gap-6 justify-center text-sm">
            <Link href="/questions" className="text-blue-600 hover:text-blue-800">
              Questions
            </Link>
            <Link href="/tags" className="text-blue-600 hover:text-blue-800">
              Tags
            </Link>
            <Link href="/profile" className="text-blue-600 hover:text-blue-800">
              Profile
            </Link>
          </div>
        </div>

        <div className="mt-12 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <Link href="/questions/add" className="text-blue-700 hover:text-blue-900">
              Ask a Question
            </Link>
            <Link href="/tags" className="text-blue-700 hover:text-blue-900">
              Explore Tags
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
