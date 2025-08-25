"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Header onMenuClick={handleMenuClick} isSidebarOpen={isSidebarOpen} />

      <div className="max-w-7xl mx-auto bg-white min-h-screen">
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

          {isSidebarOpen && (
            <div
              className="fixed top-[50px] left-0 right-0 bottom-0 bg-black bg-opacity-20 z-30 lg:hidden"
              onClick={handleSidebarClose}
            />
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
