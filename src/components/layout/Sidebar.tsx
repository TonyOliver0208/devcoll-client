import Link from "next/link";
import { X } from "lucide-react";
import { sidebarItems } from "@/constants/navigation";
import NavigationMenu from "@/components/navigation/NavigationMenu";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:static top-[50px] lg:top-0 inset-y-0 left-0 z-40 w-57 bg-white border-r border-gray-300 transition-transform duration-300 ease-in-out`}
    >
      <div className="pt-4 pb-4 overflow-y-auto h-full">
        <NavigationMenu items={sidebarItems} />
        <CollectivesSection />
        <TeamsSection />
      </div>
    </aside>
  );
}

function CollectivesSection() {
  return (
    <div className="mt-8 px-3">
      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        COLLECTIVES
      </div>
      <div className="text-xs text-gray-600 px-3 mb-4">
        Communities for your favorite technologies.
      </div>
      <Link
        href="/collectives"
        className="text-xs text-blue-600 hover:text-blue-800 px-3"
      >
        Explore all Collectives
      </Link>
    </div>
  );
}

function TeamsSection() {
  return (
    <div className="mt-8 px-3 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          TEAMS
        </span>
        <X size={14} className="text-gray-400" />
      </div>
      <div className="bg-gray-50 p-3 rounded">
        <div className="text-sm text-gray-800 mb-2">
          Ask questions, find answers and collaborate at work with Stack
          Overflow for Teams.
        </div>
        <button className="bg-orange-500 text-white px-4 py-1 rounded text-sm hover:bg-orange-600">
          Try Teams for free
        </button>
      </div>
    </div>
  );
}
