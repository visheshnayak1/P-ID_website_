import React, { useRef, useEffect, useState } from "react";
import type { DetectionResult } from "@/types";

interface ImageResultProps {
  imageUrl: string;
  detections: DetectionResult[];
  onFocus?: (detectionId: string) => void;
}

export function ImageResult({ imageUrl, detections, onFocus }: ImageResultProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [focused, setFocused] = useState<string | null>(null);

  // Update dimensions when the image loads or container resizes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    // Set initial dimensions
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [containerRef, imageUrl]);

  // Handle focusing on a detection
  const handleFocus = (id: string) => {
    setFocused(id === focused ? null : id);
    if (onFocus) {
      onFocus(id);
    }
  };

  return (
    <div 
      className="relative border border-gray-200 rounded overflow-hidden" 
      ref={containerRef}
    >
      <img 
        src={imageUrl} 
        alt="Detection Result" 
        className="w-full h-auto" 
      />
      
      {/* Render detection bounding boxes */}
      {detections.map((detection) => {
        const isFocused = detection.id === focused;
        return (
          <div 
            key={detection.id}
            className={`absolute border-2 ${isFocused ? 'border-primary bg-primary/10' : 'border-red-500 bg-red-500/10'} pointer-events-none z-10 flex items-center justify-center`}
            style={{
              left: `${detection.bbox.x}px`,
              top: `${detection.bbox.y}px`,
              width: `${detection.bbox.width}px`,
              height: `${detection.bbox.height}px`
            }}
          >
            <span className={`text-xs font-bold ${isFocused ? 'text-primary' : 'text-red-500'}`}>
              {detection.class}
            </span>
          </div>
        );
      })}
    </div>
  );
}
