import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schema for detection results
export const detections = pgTable("detections", {
  id: serial("id").primaryKey(),
  imageName: text("image_name").notNull(),
  imageSize: integer("image_size").notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
  results: jsonb("results").notNull(),
});

export const insertDetectionSchema = createInsertSchema(detections).pick({
  imageName: true,
  imageSize: true,
  results: true,
});

export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  confidenceThreshold: z.number().min(0.1).max(0.9).default(0.5),
  iouThreshold: z.number().min(0.1).max(0.9).default(0.45),
});

export type InsertDetection = z.infer<typeof insertDetectionSchema>;
export type Detection = typeof detections.$inferSelect;

// Types for detection results
export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DetectionResult = {
  id: string;
  class: string;
  confidence: number;
  bbox: BoundingBox;
};

export type ProcessedImage = {
  id: string;
  originalImage: string;
  processedImage: string;
  detections: DetectionResult[];
};
