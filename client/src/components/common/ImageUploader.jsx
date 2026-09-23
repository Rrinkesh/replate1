import React, { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, Loader2 } from "lucide-react";
import uploadService from "../../services/uploadService";

const ImageUploader = ({ onUploadSuccess, currentImage, className = "" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP formats are allowed");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const url = await uploadService.uploadImage(file);
      onUploadSuccess(url);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Image upload failed",
      );
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onUploadSuccess("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

      {currentImage ? (
        <div className="relative group rounded-xl overflow-hidden border border-charcoal-200 bg-surface-50 aspect-video flex items-center justify-center">
          <img
            src={currentImage}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="bg-white text-rose-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-soft-md hover:bg-rose-50 transition-colors"
            >
              <X className="w-4 h-4" /> Remove Image
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`
          flex flex-col items-center justify-center w-full aspect-video 
          border-2 border-dashed rounded-xl cursor-pointer transition-colors
          ${isUploading ? "bg-surface-100 border-charcoal-200" : "bg-surface-50 border-charcoal-300 hover:bg-surface-100 hover:border-brand-500"}
        `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-charcoal-500">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 mb-3 text-brand-600 animate-spin" />
                <p className="text-sm font-bold text-charcoal-700">
                  Uploading securely...
                </p>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-3 text-charcoal-400" />
                <p className="mb-1 text-sm font-bold">
                  <span className="text-brand-600">Click to upload</span> or
                  drag and drop
                </p>
                <p className="text-xs text-charcoal-400">
                  JPG, PNG, WEBP (Max 5MB)
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUploader;
