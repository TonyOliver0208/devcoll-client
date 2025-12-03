"use client";

import AiFeatures from "@/components/editor-home/ai-features";
import Banner from "@/components/editor-home/banner";
import DesignTypes from "@/components/editor-home/design-types";
import DesignModal from "@/components/editor-home/designs-modal";
import Header from "@/components/editor-home/header";
import RecentDesigns from "@/components/editor-home/recent-designs";
import SideBar from "@/components/editor-home/sidebar";
import SubscriptionModal from "@/components/subscription/premium-modal";
import { getUserDesigns } from "@/services/design-service";
import { getUserSubscription } from "@/services/subscription-service";
import { useEditorStore, useNavigationStore } from "@/store";
import { useEffect } from "react";

export default function EditorPage() {
  const {
    setUserSubscription,
    setUserDesigns,
    showPremiumModal,
    setShowPremiumModal,
    showDesignsModal,
    setShowDesignsModal,
    userDesigns,
    setUserDesignsLoading,
    userDesignsLoading,
  } = useEditorStore();
  
  const { setIsEditorMode } = useNavigationStore();

  const fetchUserSubscription = async () => {
    const response = await getUserSubscription();

    if (response.success) setUserSubscription(response.data);
  };

  async function fetchUserDesigns() {
    setUserDesignsLoading(true);
    const result = await getUserDesigns();

    if (result?.success) {
      setUserDesigns(result?.data as any);
      setUserDesignsLoading(false);
    }
  }

  useEffect(() => {
    setIsEditorMode(true);
    fetchUserSubscription();
    fetchUserDesigns();
    
    return () => {
      // Don't reset on unmount - let Navigation component handle it
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 animate-in fade-in duration-300">
      <SideBar />
      <div className="flex-1 flex flex-col ml-[72px] transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto pt-20">
          <Banner />
          <DesignTypes />
          <AiFeatures />
          <RecentDesigns />
        </main>
      </div>
      <SubscriptionModal
        isOpen={showPremiumModal}
        onClose={setShowPremiumModal}
      />
      <DesignModal
        isOpen={showDesignsModal}
        onClose={setShowDesignsModal}
        userDesigns={userDesigns}
        setShowDesignsModal={setShowDesignsModal}
        userDesignsLoading={userDesignsLoading}
      />
    </div>
  );
}
