import type { Canvas } from "fabric";

export interface DesignType {
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  width?: number;
  height?: number;
}

export interface ColorPreset {
  value: string;
  label?: string;
}

export interface TextPreset {
  name: string;
  text: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  fontStyle?: string;
}

export interface BrushSize {
  value: number;
  label: string;
}

export interface FontFamily {
  name: string;
  value: string;
}

export interface DesignData {
  _id?: string; // For backward compatibility
  id?: string; // PostgreSQL uses 'id' instead of '_id'
  name: string;
  canvasData: string | null;
  width?: number;
  height?: number;
  category?: string;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DesignResponse {
  success: boolean;
  data: DesignData | DesignData[];
  message?: string;
}

export interface UserSubscription {
  id: string;
  plan: "free" | "premium" | "enterprise";
  status: "active" | "inactive" | "cancelled";
  expiresAt?: string;
  isPremium?: boolean;
}

export interface EditorStoreState {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  
  designId: string | null;
  setDesignId: (id: string | null) => void;
  
  isEditing: boolean;
  setIsEditing: (flag: boolean) => void;
  
  name: string;
  setName: (value: string) => void;
  
  showProperties: boolean;
  setShowProperties: (flag: boolean) => void;
  
  saveStatus: "saved" | "Saving..." | "Error";
  setSaveStatus: (status: "saved" | "Saving..." | "Error") => void;
  
  lastModified: number;
  isModified: boolean;
  
  markAsModified: () => void;
  saveToServer: () => Promise<DesignResponse | null>;
  debouncedSaveToServer: () => void;
  
  userSubscription: UserSubscription | null;
  setUserSubscription: (data: UserSubscription | null) => void;
  
  userDesigns: DesignData[];
  setUserDesigns: (data: DesignData[]) => void;
  
  userDesignsLoading: boolean;
  setUserDesignsLoading: (flag: boolean) => void;
  
  showPremiumModal: boolean;
  setShowPremiumModal: (flag: boolean) => void;
  
  showDesignsModal: boolean;
  setShowDesignsModal: (flag: boolean) => void;
  
  resetStore: () => void;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface ExportOptions {
  format: "png" | "jpg" | "svg" | "pdf";
  quality?: number;
  scale?: number;
}
