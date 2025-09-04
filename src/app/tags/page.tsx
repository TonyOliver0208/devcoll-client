"use client";

import AppLayout from "@/components/layout/AppLayout";
import { TagsContainer } from "@/components/tags";
import { mockTags } from "@/constants/tags";
import { USE_MOCK_DATA } from "@/config/data-source";

export default function TagsPage() {
  return (
    <AppLayout>
      <TagsContainer 
        // Pass mock tags only if USE_MOCK_DATA is true
        // If false, TagsContainer will use React Query
        tags={USE_MOCK_DATA ? mockTags : undefined} 
      />
    </AppLayout>
  );
}
