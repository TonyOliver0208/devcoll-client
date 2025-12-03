"use client";

import { useRouter } from "next/navigation";
import DesignPreview from "./design-preview";
import { Loader, Trash2, ImagePlus } from "lucide-react";
import { deleteDesign, getUserDesigns } from "@/services/design-service";
import { useEditorStore } from "@/store";
import { DesignData } from "@/types/editor.types";

interface DesignListProps {
  listOfDesigns: DesignData[];
  isLoading: boolean;
  isModalView: boolean;
  setShowDesignsModal?: (show: boolean) => void;
}

function DesignList({
  listOfDesigns,
  isLoading,
  isModalView,
  setShowDesignsModal,
}: DesignListProps) {
  const router = useRouter();
  const { setUserDesigns } = useEditorStore();

  async function fetchUserDesigns() {
    const result = await getUserDesigns();

    if (result?.success && Array.isArray(result?.data)) {
      setUserDesigns(result.data);
    }
  }

  const handleDeleteDesign = async (getCurrentDesignId: string) => {
    const response = await deleteDesign(getCurrentDesignId);

    if (response.success) {
      fetchUserDesigns();
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div
      className={`${
        isModalView ? "p-4" : ""
      } ${listOfDesigns.length > 0 ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" : ""}`}
    >
      {!listOfDesigns.length && (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
            <ImagePlus className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No designs yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            Start creating your first design to see it here. Your creativity awaits!
          </p>
          <button
            onClick={() => router.push("/editor")}
            className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            <ImagePlus className="w-5 h-5" />
            Create Your First Design
          </button>
        </div>
      )}
      {listOfDesigns.map((design: DesignData) => {
        const designId = design?.id || design?._id;
        return (
          <div key={designId} className="group cursor-pointer">
            <div
              onClick={() => {
                router.push(`/editor/${designId}`);
                if (isModalView && setShowDesignsModal) {
                  setShowDesignsModal(false);
                }
              }}
              className="w-[300px] h-[300px] rounded-lg mb-2 overflow-hidden transition-shadow group-hover:shadow-md"
            >
              {design?.canvasData && (
                <DesignPreview design={design} />
              )}
            </div>
            <div className="flex justify-between">
              <p className="font-bold text-sm truncate">{design.name}</p>
              <Trash2
                onClick={() => designId && handleDeleteDesign(designId)}
                className="w-5 h-5 cursor-pointer hover:text-red-600 transition-colors"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DesignList;
