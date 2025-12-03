"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NavigationState {
  isEditorMode: boolean;
  setIsEditorMode: (value: boolean) => void;
  previousPath: string;
  setPreviousPath: (path: string) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      isEditorMode: false,
      setIsEditorMode: (value) => set({ isEditorMode: value }),
      previousPath: "/",
      setPreviousPath: (path) => set({ previousPath: path }),
    }),
    {
      name: "navigation-storage",
    }
  )
);
