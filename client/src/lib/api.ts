import { apiRequest } from "./queryClient";
import type { ProcessedImage, DetectionSettings } from "@/types";

/**
 * Upload and process an image with YOLOv8 detection
 */
export async function detectSymbols(
  imageFile: File,
  settings: DetectionSettings
): Promise<ProcessedImage> {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("confidenceThreshold", settings.confidenceThreshold.toString());
  formData.append("iouThreshold", settings.iouThreshold.toString());

  const response = await fetch("/api/detect", {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Detection failed with status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get detection results by ID
 */
export async function getDetectionResult(id: string): Promise<ProcessedImage> {
  const response = await fetch(`/api/results/${id}`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch result: ${response.status}`);
  }

  return await response.json();
}

/**
 * Helper function to download an image
 */
export function downloadImage(dataUrl: string, filename: string = "detection-result.jpg"): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
