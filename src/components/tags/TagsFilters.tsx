import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TagsFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function TagsFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: TagsFiltersProps) {
  const filters = [
    { id: "popular", label: "Popular" },
    { id: "name", label: "Name" },
    { id: "new", label: "New" },
  ];

  return (
    <div className="mb-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Filter by tag name"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-4 py-2 text-sm font-medium border-r border-gray-300 last:border-r-0 transition-colors ${
                activeFilter === filter.id
                  ? "bg-gray-100 text-gray-900"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
