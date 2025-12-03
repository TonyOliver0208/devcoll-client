"use client";

import MainEditor from "@/components/editor";
import { getUserDesigns } from "@/services/design-service";
import { getUserSubscription } from "@/services/subscription-service";
import { useEditorStore, useNavigationStore } from "@/store";
import { useEffect } from "react";

export default function EditorPage() {
  const { setUserSubscription, setUserDesigns } = useEditorStore();
  const { setIsEditorMode } = useNavigationStore();

  const fetchUserSubscription = async () => {
    const response = await getUserSubscription();

    if (response.success) setUserSubscription(response.data);
  };

  async function fetchUserDesigns() {
    const result = await getUserDesigns();

    if (result?.success) setUserDesigns(result?.data as any);
  }

  useEffect(() => {
    setIsEditorMode(true);
    fetchUserSubscription();
    fetchUserDesigns();
    
    return () => {
      // Navigation state will be handled by Navigation component
    };
  }, []);
  
  return (
    <div className="animate-in fade-in duration-300">
      <MainEditor />
    </div>
  );
}
