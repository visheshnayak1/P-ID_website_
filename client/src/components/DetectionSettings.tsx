import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { DetectionSettings } from "@/types";

interface DetectionSettingsProps {
  settings: DetectionSettings;
  onSettingsChange: (settings: Partial<DetectionSettings>) => void;
}

export function DetectionSettings({ settings, onSettingsChange }: DetectionSettingsProps) {
  const handleConfidenceChange = (value: number[]) => {
    const newValue = value[0];
    onSettingsChange({ confidenceThreshold: newValue });
  };

  const handleIouChange = (value: number[]) => {
    const newValue = value[0];
    onSettingsChange({ iouThreshold: newValue });
  };

  return (
    <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Detection Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Configure the detection parameters</p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="confidence" className="text-sm font-medium text-gray-700">
                Confidence Threshold
              </Label>
              <span className="text-sm text-gray-500">
                {settings.confidenceThreshold.toFixed(1)}
              </span>
            </div>
            <Slider
              id="confidence"
              min={0.1}
              max={0.9}
              step={0.1}
              value={[settings.confidenceThreshold]}
              onValueChange={handleConfidenceChange}
              className="mt-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="iou" className="text-sm font-medium text-gray-700">
                IoU Threshold
              </Label>
              <span className="text-sm text-gray-500">
                {settings.iouThreshold.toFixed(2)}
              </span>
            </div>
            <Slider
              id="iou"
              min={0.1}
              max={0.9}
              step={0.05}
              value={[settings.iouThreshold]}
              onValueChange={handleIouChange}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
