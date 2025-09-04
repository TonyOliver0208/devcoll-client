"use client";

import AppLayout from "@/components/layout/AppLayout";
import { TagsContainer } from "@/components/tags";
import { useTags } from "@/hooks/use-tags";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Wifi } from "lucide-react";
import { getErrorMessage, isNetworkError } from "@/lib/errors";

export default function TagsPage() {
  const { data: tags, isLoading, error, refetch, isRefetching } = useTags()

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tags...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    const isOffline = isNetworkError(error)
    
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="max-w-md text-center">
            {isOffline ? (
              <Wifi className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            ) : (
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            )}
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isOffline ? 'Connection Problem' : 'Failed to Load Tags'}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {getErrorMessage(error)}
            </p>
            
            <Button 
              onClick={() => refetch()} 
              disabled={isRefetching}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? 'Loading...' : 'Try Again'}
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <TagsContainer tags={Array.isArray(tags) ? tags : []} />
    </AppLayout>
  );
}
