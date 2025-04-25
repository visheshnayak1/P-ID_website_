import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FaSearch, FaDatabase, FaDownload } from "react-icons/fa";
import type { DetectionResult } from "@/types";
import { downloadImage } from "@/lib/api";

interface ResultsTableProps {
  detections: DetectionResult[];
  processedImageUrl: string;
  onFocusDetection: (id: string) => void;
}

export function ResultsTable({ detections, processedImageUrl, onFocusDetection }: ResultsTableProps) {
  const handleDownload = () => {
    downloadImage(processedImageUrl, "pid-detection-result.jpg");
  };

  const formatConfidence = (confidence: number): string => {
    return `${(confidence * 100).toFixed(0)}%`;
  };

  const getIconForClass = (className: string) => {
    // Map class names to appropriate icons
    switch (className.toLowerCase()) {
      case 'valve':
        return <FaDatabase className="text-gray-500" />;
      case 'pump':
        return <FaDatabase className="text-gray-500" />;
      case 'tank':
        return <FaDatabase className="text-gray-500" />;
      default:
        return <FaDatabase className="text-gray-500" />;
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-900">Detected Symbols</h4>
        <Button 
          variant="outline" 
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <FaDownload className="w-4 h-4" />
          Download
        </Button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detections.map((detection) => (
                <TableRow key={detection.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center">
                        {getIconForClass(detection.class)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {detection.class}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {formatConfidence(detection.confidence)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      x: {detection.bbox.x}, y: {detection.bbox.y}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="text-primary hover:text-blue-600 p-0 h-auto"
                      onClick={() => onFocusDetection(detection.id)}
                    >
                      <FaSearch className="mr-1 h-3 w-3" /> Focus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
