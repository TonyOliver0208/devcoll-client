"use client";

import { useState, useMemo } from "react";
import TagsHeader from "@/components/tags/TagsHeader";
import TagsFilters from "@/components/tags/TagsFilters";
import TagCard from "@/components/tags/TagCard";
import { TagsPageProps } from "@/types/tag";

export default function TagsContainer({ tags }: TagsPageProps) {
  const [activeFilter, setActiveFilter] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedTags = useMemo(() => {
    let filtered = tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (activeFilter) {
      case "popular":
        return filtered.sort((a, b) => b.questionsCount - a.questionsCount);
      case "name":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "new":
        return filtered.sort((a, b) => b.askedThisWeek - a.askedThisWeek);
      default:
        return filtered;
    }
  }, [tags, activeFilter, searchQuery]);

  return (
    <main className="flex-1 lg:ml-0">
      <div className="py-3 sm:py-6">
        <div className="px-2 sm:px-4">
          {/* Tags Header */}
          <TagsHeader />

          {/* Tags Filters */}
          <TagsFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Tags Content */}
          <div className="w-full">
            {/* Tags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedTags.map((tag) => (
                <TagCard key={tag.id} tag={tag} />
              ))}
            </div>

            {/* No Results Message */}
            {filteredAndSortedTags.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No tags found matching your search criteria.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your search or filter options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
