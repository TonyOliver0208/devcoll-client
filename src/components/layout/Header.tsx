import Link from "next/link";
import {
  Search,
  Menu,
  X,
  Bell,
  Trophy,
  MessageSquare,
  User,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-50 w-full">
      <div className="w-full px-4">
        <div className="max-w-7xl mx-auto flex items-center h-[50px]">
          <div className="flex items-center">
            <MobileMenuButton onClick={onMenuClick} isOpen={isSidebarOpen} />
            <Logo />
            <Navigation />
          </div>
          <SearchBar />
          <UserActions />
        </div>
      </div>
    </header>
  );
}

function MobileMenuButton({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 mr-2 hover:bg-gray-100 rounded"
    >
      {isOpen ? <X size={18} /> : <Menu size={18} />}
    </button>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center mr-6 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
    >
      <div className="text-[#F48024] font-bold text-base">
        stack<span className="text-gray-700">overflow</span>
      </div>
    </Link>
  );
}

function Navigation() {
  return (
    <nav className="hidden md:flex items-center mr-6">
      <Link
        href="/"
        className="flex items-center px-3 py-4 text-sm text-gray-700 hover:bg-gray-100 rounded border-b-2 border-[#F48024] bg-orange-50"
      >
        Home
      </Link>
      <button className="flex items-center px-3 py-4 text-sm text-gray-600 hover:bg-gray-100 rounded">
        Board
      </button>
      <button className="flex items-center px-3 py-4 text-sm text-gray-600 hover:bg-gray-100 rounded">
        Live Code
      </button>
      <button className="flex items-center px-3 py-4 text-sm text-gray-600 hover:bg-gray-100 rounded gap-1">
        Store
        <ChevronDown size={14} />
      </button>
    </nav>
  );
}

function SearchBar() {
  return (
    <div className="flex-1 max-w-2xl px-4">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search posts, developers, or tags"
          className="w-full px-10 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}

function UserActions() {
  return (
    <div className="flex items-center space-x-2">
      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors">
        <Bell size={20} />
      </button>
      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors">
        <Trophy size={20} />
      </button>
      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors">
        <MessageSquare size={20} />
      </button>
      <div className="flex items-center space-x-2 ml-2">
        <div className="w-6 h-6 bg-gray-300 rounded-sm flex items-center justify-center">
          <User size={14} className="text-gray-600" />
        </div>
        <span className="text-sm font-medium text-gray-700">P</span>
        <button className="px-3 py-1.5 bg-[#F48024] text-white text-xs font-medium rounded hover:bg-[#DA670B] transition-colors">
          Premium
        </button>
      </div>
    </div>
  );
}
