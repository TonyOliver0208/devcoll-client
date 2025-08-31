import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
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
  LogOut,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 h-[50px]">
        <div className="flex items-center justify-between h-full w-full">
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
      <Image
        src="/black-devcoll-logo.svg"
        alt="DevColl"
        width={120}
        height={24}
        priority
        className="cursor-pointer"
      />
    </Link>
  );
}

function Navigation() {
  return (
    <nav className="hidden md:flex items-center">
      <Link
        href="/"
        className="flex items-center px-3 py-4 text-sm text-gray-700 hover:bg-gray-100 rounded border-b-2 border-[#F48024] bg-orange-50 font-bold"
      >
        Canva
      </Link>
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
    <div className="flex-1 max-w-2xl">
      <div className="relative group">
        <div className="relative border-2 border-transparent rounded-sm group-focus-within:border-blue-500 transition-colors p-0.5">
          <div className="relative border border-gray-300 rounded-sm bg-white">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <input
              type="text"
              placeholder="Search posts, developers, or tags"
              className="w-full px-10 py-1.5 rounded-sm focus:outline-none placeholder:text-xs text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UserActions() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!session) {
    // Show login/signup buttons for unauthenticated users
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <button className="px-4 py-1.5 text-blue-600 border border-blue-600 text-sm font-medium rounded hover:bg-blue-50 transition-colors">
            Log in
          </button>
        </Link>
        <Link href="/login">
          <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
            Sign up
          </button>
        </Link>
      </div>
    );
  }

  // Show authenticated user actions
  return (
    <div className="flex items-center space-x-2">
      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors">
        <Bell size={20} />
      </button>
      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors">
        <MessageSquare size={20} />
      </button>
      
      {/* User Profile Dropdown */}
      <div className="relative group">
        <button className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded transition-colors">
          <div className="w-6 h-6 bg-gray-300 rounded-sm flex items-center justify-center">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={24}
                height={24}
                className="rounded-sm"
              />
            ) : (
              <User size={14} className="text-gray-600" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {session.user?.name?.charAt(0) || 'U'}
          </span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900">{session.user?.name}</div>
              <div className="text-xs text-gray-500">{session.user?.email}</div>
            </div>
            <Link href="/profile">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <User size={16} />
                Profile
              </button>
            </Link>
            <Link href="/settings">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <MessageSquare size={16} />
                Settings
              </button>
            </Link>
            <hr className="my-2" />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>
      
      <button className="px-3 py-1.5 bg-[#F48024] text-white text-xs font-medium rounded hover:bg-[#DA670B] transition-colors">
        Premium
      </button>
    </div>
  );
}
