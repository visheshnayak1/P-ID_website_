import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaUpload, FaFileImage, FaTimes, FaSearchPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onDetect: () => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelect, onDetect, isProcessing }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);

        // Generate preview
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Image</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload a P&ID diagram for symbol detection
        </p>
      </div>
      <div className="p-4 sm:p-6">
        {/* File upload zone */}
        <div
          {...getRootProps()}
          className={cn(
            "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors",
            isDragActive && "border-primary bg-blue-50"
          )}
        >
          <div className="space-y-1 text-center">
            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
              >
                <span>Upload a file</span>
                <input {...getInputProps()} id="file-upload" className="sr-only" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>

        {/* File preview */}
        {selectedFile && preview && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaFileImage className="text-primary text-2xl" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="ml-auto text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mt-4">
              <img
                src={preview}
                className="w-full h-auto rounded border border-gray-200"
                alt="Preview"
              />
            </div>
          </div>
        )}

        {/* Detect button */}
        <div className="mt-4">
          <Button
            onClick={onDetect}
            disabled={!selectedFile || isProcessing}
            className="w-full"
          >
            <FaSearchPlus className="mr-2" />
            {isProcessing ? "Processing..." : "Detect Symbols"}
          </Button>
        </div>
      </div>
    </div>
  );
}
