"use client";

import { useEffect } from "react";
import TagsHeader from "@/components/tags/TagsHeader";
import TagsFilters from "@/components/tags/TagsFilters";
import TagCard from "@/components/tags/TagCard";
import { TagsPageProps } from "@/types/tag";
import { useTagsStore } from "@/store";

export default function TagsContainer({ tags: legacyTags }: TagsPageProps) {
  const {
    allTags,
    loading,
    error,
    currentFilter,
    searchQuery,
    setFilter,
    setSearchQuery,
    fetchTags,
  } = useTagsStore();

  // Initialize with legacy tags if provided, otherwise fetch from store
  useEffect(() => {
    if (legacyTags && legacyTags.length > 0) {
      // If legacy tags are provided, use them (backward compatibility)
      return;
    }
    
    fetchTags(currentFilter);
  }, [currentFilter, fetchTags, legacyTags]);

  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    fetchTags(filter);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Use legacy tags if provided, otherwise use store tags
  const displayTags = legacyTags || allTags;

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
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading tags...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
                <button 
                  onClick={() => fetchTags(currentFilter)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Try Again
                </button>
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
