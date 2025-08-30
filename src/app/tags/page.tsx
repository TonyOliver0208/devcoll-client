"use client";

import AppLayout from "@/components/layout/AppLayout";
import { TagsContainer } from "@/components/tags";
import { mockTags } from "@/constants/tags";

export default function TagsPage() {
  return (
    <AppLayout>
      <TagsContainer tags={mockTags} />
    </AppLayout>
  );
}
