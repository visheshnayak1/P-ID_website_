import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { runPythonDetection } from "./utils/pythonRunner";
import { nanoid } from "nanoid";
import { 
  detections, 
  insertDetectionSchema, 
  type DetectionResult, 
  type ProcessedImage 
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create temporary directories if they don't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  const resultsDir = path.join(process.cwd(), "results");
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Endpoint to upload and process P&ID image
  app.post("/api/detect", upload.single('image'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const confidenceThreshold = parseFloat(req.body.confidenceThreshold || "0.5");
      const iouThreshold = parseFloat(req.body.iouThreshold || "0.45");

      if (isNaN(confidenceThreshold) || isNaN(iouThreshold)) {
        return res.status(400).json({ message: "Invalid threshold values" });
      }

      // Get the uploaded file information
      const { filename, path: filePath, size, originalname } = req.file;

      // Run YOLOv8 model detection
      const detectionResults = await runPythonDetection(filePath, {
        confidenceThreshold,
        iouThreshold
      });

      if (!detectionResults) {
        return res.status(500).json({ message: "Detection failed" });
      }

      // Convert detection results to the expected format
      const processedResults: DetectionResult[] = detectionResults.detections.map((detection: any) => ({
        id: nanoid(),
        class: detection.class,
        confidence: detection.confidence,
        bbox: {
          x: detection.bbox.x,
          y: detection.bbox.y,
          width: detection.bbox.width,
          height: detection.bbox.height
        }
      }));

      // Save detection record to storage
      const detectionRecord = await storage.saveDetection({
        imageName: originalname,
        imageSize: size,
        results: processedResults
      });

      // Create processed image record
      const resultId = detectionResults.id || nanoid();
      const processedImage: ProcessedImage = {
        id: resultId,
        originalImage: detectionResults.originalImage,
        processedImage: detectionResults.processedImage,
        detections: processedResults
      };

      // Save to cache
      await storage.saveProcessedImage(processedImage);

      // Return the results
      res.status(200).json({ 
        id: resultId,
        originalImage: processedImage.originalImage,
        processedImage: processedImage.processedImage,
        detections: processedResults
      });
    } catch (error: any) {
      console.error("Detection error:", error);
      res.status(500).json({ 
        message: error.message || "An error occurred during detection" 
      });
    }
  });

  // Endpoint to get processed image by ID
  app.get("/api/results/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const processedImage = await storage.getProcessedImage(id);
      
      if (!processedImage) {
        return res.status(404).json({ message: "Result not found" });
      }
      
      res.status(200).json(processedImage);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
