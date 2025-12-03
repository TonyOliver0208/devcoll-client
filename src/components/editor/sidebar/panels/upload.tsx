"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addImageToCanvas } from "@/fabric/fabric-utils";
import { fetchWithAuth } from "@/services/base-service";
import { uploadFileWithAuth, UploadImageResponse } from "@/services/upload-canva-service";
import { useEditorStore } from "@/store";
import { Loader2, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

interface MediaItem {
  _id: string;
  url: string;
  name: string;
  publicId?: string;
  userId: string;
}

function UploadPanel() {
  const { canvas } = useEditorStore();

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userUploads, setUserUploads] = useState<MediaItem[]>([]);

  const { data: session, status } = useSession();

  const fetchUserUploads = useCallback(async () => {
    if (status !== "authenticated" || !session?.idToken) return;

    try {
      setIsLoading(true);
      const data = await fetchWithAuth("/v1/media/get");
      console.log(data, "fetchUserUploads");
      setUserUploads(data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [status, session?.idToken]);

  useEffect(() => {
    if (status === "authenticated") fetchUserUploads();
  }, [status, fetchUserUploads]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);
    const file = e.target.files?.[0];
    
    if (!file) return;

    setIsUploading(true);

    try {
      const result = await uploadFileWithAuth(file);

      console.log('Upload result:', result);
      
      // Transform the upload response to match MediaItem interface
      const mediaItem: MediaItem = {
        _id: result.id,
        url: result.url,
        name: file.name,
        publicId: result.publicId,
        userId: result.userId,
      };
      
      setUserUploads((prev) => [mediaItem, ...prev]);
    } catch (e) {
      console.error("Error while uploading the file:", e);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAddImage = (imageUrl: string) => {
    if (!canvas) return;
    addImageToCanvas(canvas, imageUrl);
  };

  console.log(userUploads, "userUploads");

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <Label
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white
          rounded-md cursor-pointer h-12 font-medium transition-colors ${
            isUploading ? "opacity-70 cursor-not-allowed" : ""
          }
          `}
          >
            <Upload className="w-5 h-5" />
            <span>{isUploading ? "Uploading..." : "Upload Files"}</span>
            <Input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </Label>
        </div>
        <div className="mt-5">
          <h4 className="text-sm text-gray-500 mb-5">Your Uploads</h4>
          {isLoading ? (
            <div className="border p-6 flex rounded-md items-center justify-center">
              <Loader2 className="w-4 h-4" />
              <p className="font-bold text-sm">Loading your uploads...</p>
            </div>
          ) : userUploads.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {userUploads.filter(Boolean).map((imageData) => (
                <div
                  className="aspect-auto bg-gray-50 rounded-md overflow-hidden hover:opacity-85 transition-opacity relative group cursor-pointer"
                  key={imageData._id}
                  onClick={() => handleAddImage(imageData.url)}
                >
                  <img
                    src={imageData.url}
                    alt={imageData.name || 'Uploaded image'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>No Uploads yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadPanel;
