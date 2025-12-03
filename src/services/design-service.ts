import type { Canvas } from "fabric";
import type { DesignData, DesignResponse } from "@/types/editor.types";
import { fetchWithAuth } from "./base-service";

export async function getUserDesigns(): Promise<DesignResponse> {
  return fetchWithAuth("/designs");
}

export async function getUserDesignByID(designId: string): Promise<DesignResponse> {
  return fetchWithAuth(`/designs/${designId}`);
}

export async function saveDesign(
  designData: Partial<DesignData>,
  designId: string | null = null
): Promise<DesignResponse> {
  // Use PUT to update existing design, POST to create new
  if (designId) {
    return fetchWithAuth(`/designs/${designId}`, {
      method: "PUT",
      body: designData,
    });
  } else {
    return fetchWithAuth(`/designs`, {
      method: "POST",
      body: designData,
    });
  }
}

export async function deleteDesign(designId: string): Promise<DesignResponse> {
  return fetchWithAuth(`/designs/${designId}`, {
    method: "DELETE",
  });
}

export async function saveCanvasState(
  canvas: Canvas,
  designId: string | null = null,
  title: string = "Untitled Design"
): Promise<DesignResponse | false> {
  if (!canvas) return false;

  try {
    // Export canvas data with custom properties but exclude dimensions
    const canvasData = canvas.toJSON(["id", "filters"]);
    
    // Remove width and height from canvas JSON to prevent override on load
    // We store dimensions separately in the database
    delete canvasData.width;
    delete canvasData.height;

    const designData: Partial<DesignData> = {
      name: title,
      canvasData: JSON.stringify(canvasData),
      width: canvas.width,
      height: canvas.height,
    };

    return saveDesign(designData, designId);
  } catch (error) {
    console.error("Error saving canvas state:", error);
    throw error;
  }
}
