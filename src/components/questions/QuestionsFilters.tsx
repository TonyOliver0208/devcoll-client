"use client";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface QuestionsFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filterOptions = [
  { id: "newest", label: "Newest" },
  { id: "active", label: "Active" },
  { id: "bountied", label: "Bountied", badge: "20" },
  { id: "unanswered", label: "Unanswered" },
  { id: "more", label: "More" },
];

export default function QuestionsFilters({
  activeFilter,
  onFilterChange,
}: QuestionsFiltersProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
      <div className="flex items-center gap-2">
        {filterOptions.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "ghost"}
            onClick={() => onFilterChange(filter.id)}
            className={`relative ${
              activeFilter === filter.id
                ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {filter.label}
            {filter.badge && (
              <span className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                {filter.badge}
              </span>
            )}
          </Button>
        ))}
      </div>

      <Button variant="outline" className="flex items-center gap-2">
        <Filter size={16} />
        Filter
      </Button>
    </div>
  );
}
