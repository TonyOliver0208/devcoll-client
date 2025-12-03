"use client";

import { ArrowLeft, Crown, LogOut, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useEditorStore } from "@/store";
import Image from "next/image";

function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const { setIsEditorMode, previousPath } = useNavigationStore();
  const { userSubscription } = useEditorStore();

  const handleLogout = async () => {
    await signOut();
  };

  const handleBackToForum = () => {
    setIsEditorMode(false);
    router.push(previousPath || "/");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6 fixed top-0 right-0 left-[72px] z-10 transition-all duration-300 ease-in-out">
      <button
        onClick={handleBackToForum}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-4"
      >
        <ArrowLeft size={18} />
        <span className="font-medium">Back to Forum</span>
      </button>
      
      <div className="flex items-center gap-2 mr-4">
        <Image
          src="/black-devcoll-logo.svg"
          alt="DevColl"
          width={100}
          height={20}
          priority
        />
        <span className="text-sm text-gray-500 font-medium">Design Studio</span>
      </div>

      <div className="flex-1 max-w-2xl mx-auto relative">
        <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          className="pl-10 py-6 border-gray-200 bg-gray-50 focus-visible:ring-[#F48024] text-base"
          placeholder="Search your projects and designs..."
        />
      </div>
      <div className="flex items-center gap-5 ml-4">
        <div className="flex items-center gap-1 cursor-pointer">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 ">
                <Avatar>
                  <AvatarFallback>
                    {session?.user?.name?.[0] || "U"}
                  </AvatarFallback>
                    <AvatarImage
                      src={session?.user?.image || "https://ui-avatars.com/api/?name=User&background=F48024&color=fff"}
                  />
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {session?.user?.name || "User"}
                  </span>
                  {userSubscription?.isPremium && (
                    <span className="text-xs text-yellow-600 flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={handleLogout}
                className={"cursor-pointer"}
              >
                <LogOut className="mr-2 w-4 h-4" />
                <span className="font-bold">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
