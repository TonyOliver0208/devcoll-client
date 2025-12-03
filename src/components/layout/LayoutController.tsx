"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useNavigationStore } from "@/store/useNavigationStore";

export function LayoutController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setIsEditorMode } = useNavigationStore();

  useEffect(() => {
    // Update editor mode based on current path
    const isEditor = pathname?.startsWith("/editor");
    setIsEditorMode(isEditor);
  }, [pathname, setIsEditorMode]);

  return <>{children}</>;
}
