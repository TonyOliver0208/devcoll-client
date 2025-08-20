import Link from 'next/link';
import Image from 'next/image';
import { Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const navigationItems = [
    { icon: '🏠', label: 'Home', href: '/' },
    { icon: '👥', label: 'Friends', href: '/friends' },
    { icon: '📊', label: 'All reports', href: '/reports' },
    { icon: '🌍', label: 'Geography', href: '/geography' },
    { icon: '💬', label: 'Conversations', href: '/conversations' },
    { icon: '💰', label: 'Deals', href: '/deals' },
    { icon: '📤', label: 'Export', href: '/export' },
  ];

  return (
    <nav className="h-full p-4 flex flex-col justify-between">
      <div className="space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* User Profile Block */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="px-4 py-3 rounded-lg hover:bg-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/next.svg"
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-medium">Tony Oliver</h3>
              <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                Admin
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            <button
              className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-200 w-full"
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
