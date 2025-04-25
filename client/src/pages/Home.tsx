import React, { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { DetectionSettings } from "@/components/DetectionSettings";
import { DetectionResults } from "@/components/DetectionResults";
import { Layout } from "@/components/Layout";
import { useDetection } from "@/hooks/use-detection";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { state, settings, uploadAndDetect, updateSettings, reset } = useDetection();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleDetection = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadAndDetect(selectedFile);
    } catch (error) {
      console.error("Detection error:", error);
    }
  };

  const handleTryAgain = () => {
    reset();
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">P&ID Symbol Detection</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload P&ID diagrams to detect and analyze symbols using YOLOv8.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section - 1/3 width on large screens */}
        <div className="lg:col-span-1">
          {/* File Upload Component */}
          <FileUpload
            onFileSelect={handleFileSelect}
            onDetect={handleDetection}
            isProcessing={state.status === "loading"}
          />

          {/* Detection Settings */}
          {(selectedFile || state.status !== "idle") && (
            <DetectionSettings
              settings={settings}
              onSettingsChange={updateSettings}
            />
          )}
        </div>

        {/* Results Section - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <DetectionResults
            state={state}
            onTryAgain={handleTryAgain}
          />
        </div>
      </div>
    </Layout>
  );
}
