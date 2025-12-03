"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useEditorStore, useNavigationStore } from "@/store";
import {
  ArrowLeft,
  ChevronDown,
  Crown,
  Download,
  Eye,
  Loader2,
  LogOut,
  Pencil,
  Save,
  SaveOff,
  Share,
  Star,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ExportModal from "../export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Header() {
  const {
    isEditing,
    setIsEditing,
    name,
    setName,
    canvas,
    saveStatus,
    markAsModified,
    designId,
    userDesigns,
    userSubscription,
    setShowPremiumModal,
  } = useEditorStore();
  const { data: session } = useSession();
  const router = useRouter();
  const { setIsEditorMode, previousPath } = useNavigationStore();
  const [showExportModal, setShowExportModal] = useState(false);

  const handleLogout = () => {
    signOut();
  };

  const handleBackToEditor = () => {
    router.push("/editor");
  };

  useEffect(() => {
    if (!canvas) return;
    canvas.selection = isEditing;
    canvas.getObjects().forEach((obj) => {
      obj.selectable = isEditing;
      obj.evented = isEditing;
    });
  }, [isEditing]);

  useEffect(() => {
    if (!canvas || !designId) return;
    markAsModified();
  }, [name, canvas, designId]);

  const handleExport = () => {
    if (userDesigns?.length >= 5 && !userSubscription?.isPremium) {
      toast.error("Please upgrade to premium!", {
        description: "You need to upgrade to premium to create more designs",
      });

      return;
    }
    setShowExportModal(true);
  };

  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14 shadow-sm transition-all duration-300">
      <div className="flex items-center space-x-3">
        <button
          onClick={handleBackToEditor}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Editor Home"
        >
          <ArrowLeft size={16} />
        </button>
        
        <Link href={"/editor"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/black-devcoll-logo.svg"
            alt="DevColl"
            width={90}
            height={24}
            priority
          />
          <span className="text-xs text-gray-500 font-medium">Studio</span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium">
              <span>{isEditing ? "Editing" : "Viewing"}</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editing</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditing(false)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Viewing</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          className={
            "relative flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          }
          title={saveStatus !== "Saving..." ? "Save" : saveStatus}
          disabled={saveStatus === "Saving..."}
        >
          {saveStatus === "Saving..." ? (
            <div className="relative flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#F48024]" />
              <span className="sr-only">Saving...</span>
            </div>
          ) : (
            <Save
              className={cn("h-5 w-5 text-gray-700", saveStatus === "saved" && "text-gray-600")}
            />
          )}

          {saveStatus === "Saving..." && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
        </button>
        <button
          onClick={handleExport}
          className="header-button ml-3 relative"
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex justify-center max-w-md">
        <Input
          className="w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowPremiumModal(true)}
          className={cn(
            "flex items-center rounded-lg h-9 px-4 transition-all shadow-sm font-medium",
            userSubscription?.isPremium
              ? "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white"
              : "bg-gradient-to-r from-[#F48024] to-[#ff7a45] hover:from-[#ff7a45] hover:to-[#F48024] text-white"
          )}
        >
          {userSubscription?.isPremium ? (
            <Crown className="mr-1 h-4 w-4 text-yellow-100 fill-yellow-100" />
          ) : (
            <Star className="mr-1 h-4 w-4 text-yellow-200 fill-yellow-200" />
          )}
          <span className="text-sm">
            {!userSubscription?.isPremium ? "Upgrade" : "Premium"}
          </span>
        </button>
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
      <ExportModal isOpen={showExportModal} onClose={setShowExportModal} />
    </header>
  );
}

export default Header;
