"use client";

import { saveDesign } from "@/services/design-service";
import { useEditorStore } from "@/store";
import { CreditCard, FolderOpen, Home, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

function SideBar() {
  const router = useRouter();
  const { setShowPremiumModal, setShowDesignsModal } = useEditorStore();

  const handleCreateNewDesign = async () => {
    try {
      const initialDesignData = {
        name: "Untitled design - Youtube Thumbnail",
        canvasData: JSON.stringify({ objects: [], background: "#ffffff" }),
        width: 825,
        height: 465,
        category: "youtube_thumbnail",
      };

      const newDesign = await saveDesign(initialDesignData);

      if (newDesign?.success) {
        router.push(`/editor/${newDesign?.data?.id}`);
      } else {
        throw new Error("Failed to create new design");
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <aside className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 fixed left-0 top-0 h-full z-20 transition-all duration-300 ease-in-out">
      <div
        onClick={handleCreateNewDesign}
        className="flex flex-col items-center"
      >
        <button className="w-12 h-12 bg-[#F48024] rounded-full flex items-center justify-center text-white hover:bg-[#f48024]/90 transition-colors shadow-md">
          <Plus className="w-6 h-6" />
        </button>
        <div className="text-xs font-medium text-center mt-1 text-gray-700">
          Create
        </div>
      </div>
      <nav className="mt-8 flex flex-col items-center space-y-6 w-full">
        {[
          {
            icon: <Home className="h-6 w-6" />,
            label: "Home",
            active: true,
          },
          {
            icon: <FolderOpen className="h-6 w-6" />,
            label: "Projects",
            active: false,
          },
          {
            icon: <CreditCard className="h-6 w-6" />,
            label: "Billing",
            active: false,
          },
        ].map((menuItem, index) => (
          <div
            onClick={
              menuItem.label === "Billing"
                ? () => setShowPremiumModal(true)
                : menuItem.label === "Projects"
                ? () => setShowDesignsModal(true)
                : null
            }
            key={index}
            className="flex cursor-pointer flex-col items-center w-full"
          >
            <div className="w-full flex flex-col items-center py-2 text-gray-600 hover:bg-orange-50 hover:text-[#F48024] transition-colors rounded-lg">
              <div className="relative">{menuItem.icon}</div>
              <span className="text-xs font-medium mt-1">{menuItem.label}</span>
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default SideBar;
