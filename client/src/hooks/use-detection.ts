import { useState } from "react";
import { detectSymbols } from "@/lib/api";
import type { DetectionState, DetectionSettings } from "@/types";

export function useDetection() {
  const [state, setState] = useState<DetectionState>({ status: 'idle' });
  const [settings, setSettings] = useState<DetectionSettings>({
    confidenceThreshold: 0.5,
    iouThreshold: 0.45
  });

  const uploadAndDetect = async (file: File) => {
    try {
      setState({ status: 'loading' });
      const result = await detectSymbols(file, settings);
      setState({ status: 'success', data: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setState({ status: 'error', error: errorMessage });
      throw error;
    }
  };

  const reset = () => {
    setState({ status: 'idle' });
  };

  const updateSettings = (newSettings: Partial<DetectionSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return {
    state,
    settings,
    uploadAndDetect,
    updateSettings,
    reset
  };
}
