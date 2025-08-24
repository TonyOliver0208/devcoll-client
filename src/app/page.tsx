"use client";

import { useSession } from "next-auth/react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/home/MainContent";
import { useSidebar } from "@/hooks/useSidebar";

export default function HomePage() {
  const { data: session } = useSession();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();

  const username = session?.user?.name || "Phước Long Nguyễn";

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {isSidebarOpen && (
          <div
            className="fixed top-[50px] left-0 right-0 bottom-0 bg-black bg-opacity-20 z-30 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        <MainContent username={username} />
      </div>
    </div>
  );
}
