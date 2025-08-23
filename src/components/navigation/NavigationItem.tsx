import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface NavigationItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  href: string;
  badge?: string;
}

export default function NavigationItem({
  icon: Icon,
  label,
  active,
  href,
  badge,
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-100 ${
        active
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
