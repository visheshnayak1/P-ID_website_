export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  id: string;
  class: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface ProcessedImage {
  id: string;
  originalImage: string;
  processedImage: string;
  detections: DetectionResult[];
}

export interface DetectionSettings {
  confidenceThreshold: number;
  iouThreshold: number;
}

export type DetectionState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success', data: ProcessedImage }
  | { status: 'error', error: string };
