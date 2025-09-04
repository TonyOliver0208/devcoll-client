"use client";

import { useEffect } from "react";
import TagsHeader from "@/components/tags/TagsHeader";
import TagsFilters from "@/components/tags/TagsFilters";
import TagCard from "@/components/tags/TagCard";
import { TagsPageProps } from "@/types/tag";
import { useTags } from "@/hooks/use-tags";
import { useTagsStore } from "@/store";
import type { Tag } from "@/types/tag";

export default function TagsContainer({ tags: legacyTags }: TagsPageProps) {
  // Only use React Query if no legacy tags are provided
  const shouldUseQuery = !legacyTags || legacyTags.length === 0;
  
  // Use React Query for data fetching
  const { 
    data: queryTags, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useTags({ enabled: shouldUseQuery });

  const {
    currentFilter,
    searchQuery,
    setFilter,
    setSearchQuery,
  } = useTagsStore();

  // Priority: legacy tags > React Query data > empty array
  const allTags: Tag[] = legacyTags || (queryTags as Tag[]) || [];
  const loading = shouldUseQuery ? isLoading : false;
  const errorState = shouldUseQuery && isError ? (error?.message || 'Failed to load tags') : null;

  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    // Note: Filter changes would trigger React Query refetch via query key changes
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Use the computed allTags which includes priority logic
  const displayTags = allTags;

  return (
    <main className="flex-1 lg:ml-0">
      <div className="py-3 sm:py-6">
        <div className="px-2 sm:px-4">
          {/* Tags Header */}
          <TagsHeader />

          {/* Tags Filters */}
          <TagsFilters
            activeFilter={currentFilter}
            onFilterChange={handleFilterChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
          />

          {/* Tags Content */}
          <div className="w-full">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading tags...</p>
                </div>
              </div>
            ) : errorState ? (
              <div className="flex justify-center items-center py-20">
                <div className="max-w-md w-full text-center">
                  <div className="mb-6">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Hmm, tags aren't loading right now
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      Something went wrong while loading the tags. Give it another shot and we'll get you browsing topics in no time!
                    </p>
                  </div>
                  
                  <button
                    onClick={() => refetch()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tags Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayTags.map((tag) => (
                    <TagCard key={tag.id} tag={tag} />
                  ))}
                </div>

                {/* No Results Message */}
                {displayTags.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                      No tags found matching your search criteria.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Try adjusting your search or filter options.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
