"use client";

import { Crown, Loader } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { saveDesign } from "@/services/design-service";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/store";
import { toast } from "sonner";

function Banner() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userSubscription, userDesigns } = useEditorStore();

  console.log(userSubscription, "userSubscription");

  const handleCreateNewDesign = async () => {
    if (userDesigns?.length >= 5 && !userSubscription.isPremium) {
      toast.error("Please upgrade to premium!", {
        description: "You need to upgrade to premium to create more designs",
      });

      return;
    }
    if (loading) return;
    try {
      setLoading(true);

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
        setLoading(false);
      } else {
        throw new Error("Failed to create new design");
      }

      console.log(newDesign, "newDesign");
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-r from-[#F48024] via-[#ff7a45] to-[#F48024] text-white p-4 sm:p-6 md:p-8 text-center shadow-lg">
      <div className="flex flex-col sm:flex-row justify-center items-center mb-2 sm:mb-4">
        <Crown className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-yellow-200 " />
        <span className="sm:ml-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          DevColl Design Studio
        </span>
      </div>
      <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-4 sm:mb-6 max-w-2xl mx-auto opacity-95">
        Create professional designs for your developer community
      </h2>
      <Button
        onClick={handleCreateNewDesign}
        className="text-[#F48024] bg-white hover:bg-gray-100 rounded-lg px-4 py-2 sm:px-6 sm:py-2.5 font-semibold shadow-md transition-all"
      >
        {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
        Start Designing
      </Button>
    </div>
  );
}

export default Banner;
