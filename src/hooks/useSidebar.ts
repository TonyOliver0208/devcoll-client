"use client";

import { useState } from "react";

export function useSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar
  };
}