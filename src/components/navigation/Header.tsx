import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 max-w-[1800px] mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/next.svg"
              alt="Logo"
              width={32}
              height={32}
              className="w-8"
            />
            <span className="font-semibold text-l">DevColl</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 text-sm"
            >
              Home
            </Link>
            <Link
              href="/board"
              className="text-gray-700 hover:text-gray-900 text-sm"
            >
              Board
            </Link>
            <Link
              href="/live-code"
              className="text-gray-700 hover:text-gray-900 text-sm"
            >
              Live Code
            </Link>
            <Link
              href="/store"
              className="text-gray-700 hover:text-gray-900 text-sm"
            >
              Store
            </Link>
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search posts, developers, or tags"
              className="w-full px-10 py-1 border border-gray-300 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <div className="px-3 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full text-sm font-medium">
            Premium
          </div>
          <button className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Sign in
          </button>
          <button className="px-4 py-1.5 text-sm text-white bg-[#FFA116] hover:bg-[#F28C01] rounded-lg">
            Register
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
