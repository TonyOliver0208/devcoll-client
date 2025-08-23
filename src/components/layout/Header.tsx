// import Image from "next/image";
// import Link from "next/link";
// import { Search } from "lucide-react";

// const Header = () => {
//   return (
//     <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 shadow-sm">
//       <div className="flex items-center justify-between h-full px-4 max-w-[1800px] mx-auto">
//         {/* Left Section */}
//         <div className="flex items-center gap-8">
//           <Link href="/" className="flex items-center gap-2">
//             <Image
//               src="/next.svg"
//               alt="Logo"
//               width={32}
//               height={32}
//               className="w-8"
//             />
//             <span className="font-semibold text-l">DevColl</span>
//           </Link>
//           <nav className="flex items-center gap-6">
//             <Link
//               href="/"
//               className="text-gray-700 hover:text-gray-900 text-sm"
//             >
//               Home
//             </Link>
//             <Link
//               href="/board"
//               className="text-gray-700 hover:text-gray-900 text-sm"
//             >
//               Board
//             </Link>
//             <Link
//               href="/live-code"
//               className="text-gray-700 hover:text-gray-900 text-sm"
//             >
//               Live Code
//             </Link>
//             <Link
//               href="/store"
//               className="text-gray-700 hover:text-gray-900 text-sm"
//             >
//               Store
//             </Link>
//           </nav>
//         </div>

//         {/* Center Section - Search */}
//         <div className="flex-1 max-w-2xl px-4">
//           <div className="relative group">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search posts, developers, or tags"
//               className="w-full px-10 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//         </div>

//         {/* Right Section */}
//         <div className="flex items-center gap-4">
//           <div className="px-3 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full text-sm font-medium">
//             Premium
//           </div>
//           <button className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
//             Sign in
//           </button>
//           <button className="px-4 py-1.5 text-sm text-white bg-[#FFA116] hover:bg-[#F28C01] rounded-lg">
//             Register
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import Link from "next/link";
import {
  Search,
  Menu,
  X,
  Bell,
  Trophy,
  MessageSquare,
  User,
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-full px-4">
        <div className="flex items-center h-12">
          <MobileMenuButton onClick={onMenuClick} isOpen={isSidebarOpen} />
          <Logo />
          <Navigation />
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
    <button onClick={onClick} className="lg:hidden p-2 mr-2">
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center mr-8">
      <div className="text-orange-500 font-bold text-xl">
        stack<span className="text-gray-800">overflow</span>
      </div>
    </Link>
  );
}

function Navigation() {
  return (
    <nav className="hidden md:flex items-center space-x-4 mr-8">
      <button className="text-gray-700 hover:text-gray-900 px-3 py-2">
        Products
      </button>
    </nav>
  );
}

function SearchBar() {
  return (
    <div className="flex-1 max-w-2xl mx-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}

function UserActions() {
  return (
    <div className="flex items-center space-x-2">
      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
        <Bell size={18} />
      </button>
      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
        <Trophy size={18} />
      </button>
      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
        <MessageSquare size={18} />
      </button>
      <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
        <User size={16} className="text-gray-600" />
        <span className="text-sm font-medium">P</span>
      </div>
    </div>
  );
}
