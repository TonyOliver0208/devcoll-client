'use client'

import { useState } from 'react'
import { useAuth, useProfile, useUpdateProfile } from '@/hooks/use-auth'
import { useQuestions, useCreateQuestion } from '@/hooks/use-questions'
import { useEnhancedSearch } from '@/hooks/use-search'
import { handleAPIError } from '@/lib/api-client'

/**
 * Example Component showing integration with new API Gateway architecture
 * This demonstrates OAuth token forwarding and enterprise error handling
 */
export function APIIntegrationExample() {
  const [newQuestionTitle, setNewQuestionTitle] = useState('')
  const [newQuestionContent, setNewQuestionContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Authentication hooks
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  // Questions hooks
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuestions({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const createQuestionMutation = useCreateQuestion()

  // Search hooks
  const {
    performSearch,
    results: searchResults,
    isSearching,
    searchError,
    suggestions,
    isFetchingSuggestions
  } = useEnhancedSearch()

  const handleCreateQuestion = async () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      await createQuestionMutation.mutateAsync({
        title: newQuestionTitle,
        content: newQuestionContent,
        tags: ['example', 'test']
      })
      
      setNewQuestionTitle('')
      setNewQuestionContent('')
      alert('Question created successfully!')
    } catch (error) {
      alert(`Failed to create question: ${handleAPIError(error)}`)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: user?.name || '',
        bio: 'Updated via API Gateway integration'
      })
      
      alert('Profile updated successfully!')
    } catch (error) {
      alert(`Failed to update profile: ${handleAPIError(error)}`)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, { type: 'all' })
    }
  }

  if (authLoading) {
    return <div className="p-4">Loading authentication...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">
          API Gateway Integration Example
        </h1>
        <p className="text-blue-700">
          This component demonstrates the new OAuth token forwarding architecture.
          All requests go through the API Gateway with Google OAuth tokens.
        </p>
      </div>

      {/* Authentication Status */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Authentication Status</h2>
        {isAuthenticated ? (
          <div className="text-green-600">
            ✅ Authenticated as {user?.email}
            <div className="mt-2 space-y-1 text-sm">
              <div>Name: {user?.name || 'Not set'}</div>
              <div>ID: {user?.id || 'Not available'}</div>
            </div>
          </div>
        ) : (
          <div className="text-red-600">❌ Not authenticated</div>
        )}
      </div>

      {/* Profile Management */}
      {isAuthenticated && (
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Profile Management</h2>
          {profileLoading ? (
            <div>Loading profile...</div>
          ) : profileError ? (
            <div className="text-red-600">
              Error: {handleAPIError(profileError)}
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <strong>Current Profile:</strong>
                <pre className="mt-1 text-sm bg-gray-100 p-2 rounded">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </div>
              <button
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Questions Management */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Questions</h2>
        
        {/* Create Question */}
        {isAuthenticated && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Create New Question</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Question title"
                value={newQuestionTitle}
                onChange={(e) => setNewQuestionTitle(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="Question content"
                value={newQuestionContent}
                onChange={(e) => setNewQuestionContent(e.target.value)}
                className="w-full p-2 border rounded h-20"
              />
              <button
                onClick={handleCreateQuestion}
                disabled={createQuestionMutation.isPending}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {createQuestionMutation.isPending ? 'Creating...' : 'Create Question'}
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div>
          <h3 className="font-medium mb-2">Recent Questions</h3>
          {questionsLoading ? (
            <div>Loading questions...</div>
          ) : questionsError ? (
            <div className="text-red-600">
              Error: {handleAPIError(questionsError)}
            </div>
          ) : questions && Array.isArray(questions) && questions.length > 0 ? (
            <div className="space-y-2">
              {questions.slice(0, 5).map((question: any, index: number) => (
                <div key={question.id || index} className="p-2 bg-gray-100 rounded">
                  <div className="font-medium">{question.title}</div>
                  <div className="text-sm text-gray-600 truncate">
                    {question.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No questions found</div>
          )}
        </div>
      </div>

      {/* Search Functionality */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Search</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search questions, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {/* Search Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="text-sm">
              <strong>Suggestions:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestions.slice(0, 5).map((suggestion: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(suggestion.text || suggestion)}
                    className="bg-gray-200 px-2 py-1 rounded text-xs hover:bg-gray-300"
                  >
                    {suggestion.text || suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchError ? (
            <div className="text-red-600">
              Search Error: {handleAPIError(searchError)}
            </div>
          ) : searchResults && (
            <div>
              <strong>Search Results:</strong>
              <pre className="mt-1 text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(searchResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* API Status */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">API Status</h2>
        <div className="text-sm space-y-1">
          <div>API Gateway URL: {process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000'}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
          <div>OAuth Integration: ✅ Active</div>
          <div>Token Exchange Pattern: ✅ Implemented</div>
        </div>
      </div>
    </div>
  )
}