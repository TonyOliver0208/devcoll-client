"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface NavigationItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
}

export default function NavigationItem({
  icon: Icon,
  label,
  href,
  badge,
}: NavigationItemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Parse the href to handle query parameters
  const [hrefPath, hrefQuery] = href.split('?');
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
  
  // Check for exact match or if we're on a sub-route
  const isActive = currentUrl === href ||
    pathname === href || 
    (href === '/questions' && pathname.startsWith('/questions/')) ||
    (href === '/' && pathname === '/') ||
    // Special case for profile with tabs
    (hrefPath === '/profile' && pathname === '/profile' && 
     hrefQuery && searchParams.get('tab') === new URLSearchParams(hrefQuery).get('tab'));
  
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-100 ${
        isActive
          ? "bg-orange-50 text-orange-600 border-r-4 border-orange-600"
          : "text-gray-700"
      }`}
    >
      <div className="flex items-center">
        <Icon size={16} className="mr-3" />
        {label}
      </div>
      {badge && (
        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}
