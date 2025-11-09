"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean; // Option to render without sidebar constraint
}

export default function AppLayout({ children, fullWidth = false }: AppLayoutProps) {
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
        {fullWidth ? (
          // Full width layout for pages like 404
          <div className="w-full">
            {children}
          </div>
        ) : (
          // Normal layout with sidebar
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
        )}
      </div>
    </div>
  );
}
