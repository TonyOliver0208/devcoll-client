"use client";

import { centerCanvas } from "@/fabric/fabric-utils";
import { saveCanvasState } from "@/services/design-service";
import { debounce } from "lodash";
import { create } from "zustand";
import type { EditorStoreState } from "@/types/editor.types";

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  canvas: null,
  setCanvas: (canvas) => {
    set({ canvas });
    // Don't auto-center here - let the component handle it after dimensions are set
  },

  designId: null,
  setDesignId: (id) => set({ designId: id }),

  isEditing: true,
  setIsEditing: (flag) => set({ isEditing: flag }),

  name: "Untitled Design",
  setName: (value) => set({ name: value }),

  showProperties: false,
  setShowProperties: (flag) => set({ showProperties: flag }),

  saveStatus: "saved" as const,
  setSaveStatus: (status) => set({ saveStatus: status }),
  lastModified: Date.now(),
  isModified: false,

  markAsModified: () => {
    const designId = get().designId;

    if (designId) {
      set({
        lastModified: Date.now(),
        saveStatus: "Saving..." as const,
        isModified: true,
      });

      get().debouncedSaveToServer();
    } else {
      console.error("No design ID Available");
    }
  },

  saveToServer: async () => {
    const designId = get().designId;
    const canvas = get().canvas;

    if (!canvas || !designId) {
      console.log("No design ID Available or canvas instance is not available");
      return null;
    }

    try {
      const savedDesign = await saveCanvasState(canvas, designId, get().name);

      set({
        saveStatus: "saved" as const,
        isModified: false,
      });

      return savedDesign || null;
    } catch (e) {
      set({ saveStatus: "Error" as const });
      return null;
    }
  },

  debouncedSaveToServer: debounce(() => {
    get().saveToServer();
  }, 500),

  userSubscription: null,
  setUserSubscription: (data) => set({ userSubscription: data }),

  userDesigns: [],
  setUserDesigns: (data) => set({ userDesigns: data }),

  userDesignsLoading: false,
  setUserDesignsLoading: (flag) => set({ userDesignsLoading: flag }),

  showPremiumModal: false,
  setShowPremiumModal: (flag) => set({ showPremiumModal: flag }),

  showDesignsModal: false,
  setShowDesignsModal: (flag) => set({ showDesignsModal: flag }),

  resetStore: () => {
    set({
      canvas: null,
      designId: null,
      isEditing: true,
      name: "Untitled Design",
      showProperties: false,
      saveStatus: "saved" as const,
      isModified: false,
      lastModified: Date.now(),
    });
  },
}));
