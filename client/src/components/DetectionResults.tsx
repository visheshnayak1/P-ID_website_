import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaUpload, FaExclamationTriangle, FaDownload } from "react-icons/fa";
import { ImageResult } from "@/components/ImageResult";
import { ResultsTable } from "@/components/ResultsTable";
import type { ProcessedImage } from "@/types";
import { downloadImage } from "@/lib/api";

interface DetectionResultsProps {
  state: {
    status: string;
    error?: string;
    data?: ProcessedImage;
  };
  onTryAgain: () => void;
}

export function DetectionResults({ state, onTryAgain }: DetectionResultsProps) {
  const [focusedDetection, setFocusedDetection] = useState<string | null>(null);

  const handleFocusDetection = (id: string) => {
    setFocusedDetection(id === focusedDetection ? null : id);
  };

  // Initial state (no image uploaded)
  if (state.status === "idle") {
    return (
      <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <FaUpload className="text-gray-300 text-5xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No image uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload a P&ID diagram to start detection
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (state.status === "loading") {
    return (
      <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-opacity-25 border-t-primary mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Processing image</h3>
          <p className="mt-1 text-sm text-gray-500">
            Detecting symbols using YOLOv8 model
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.status === "error") {
    return (
      <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block rounded-full h-12 w-12 flex items-center justify-center bg-red-100 mb-4">
            <FaExclamationTriangle className="text-error text-xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Detection failed</h3>
          <p className="mt-1 text-sm text-gray-500">{state.error || "An unknown error occurred"}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={onTryAgain}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Results state
  if (state.status === "success" && state.data) {
    const { processedImage, detections } = state.data;
    
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Detection Results
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              <span>{detections.length}</span> symbols detected
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => downloadImage(processedImage, "pid-detection-result.jpg")}
              className="flex items-center gap-2"
            >
              <FaDownload className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {/* Image with detections */}
          <ImageResult 
            imageUrl={processedImage} 
            detections={detections} 
            onFocus={handleFocusDetection}
          />
          
          {/* Table of detections */}
          <ResultsTable 
            detections={detections} 
            processedImageUrl={processedImage}
            onFocusDetection={handleFocusDetection}
          />
        </div>
      </div>
    );
  }

  // Fallback (shouldn't happen)
  return null;
}
