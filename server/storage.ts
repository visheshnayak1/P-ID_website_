import { 
  users, 
  type User, 
  type InsertUser, 
  detections, 
  type Detection, 
  type InsertDetection, 
  type ProcessedImage, 
  type DetectionResult 
} from "@shared/schema";
import { nanoid } from "nanoid";

// Extended storage interface with detection methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Detection methods
  saveDetection(detection: InsertDetection): Promise<Detection>;
  getDetection(id: number): Promise<Detection | undefined>;
  getLatestDetections(limit?: number): Promise<Detection[]>;
  
  // Processed image cache
  saveProcessedImage(data: ProcessedImage): Promise<ProcessedImage>;
  getProcessedImage(id: string): Promise<ProcessedImage | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private detectionRecords: Map<number, Detection>;
  private processedImages: Map<string, ProcessedImage>;
  private userId: number;
  private detectionId: number;

  constructor() {
    this.users = new Map();
    this.detectionRecords = new Map();
    this.processedImages = new Map();
    this.userId = 1;
    this.detectionId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Detection methods
  async saveDetection(detection: InsertDetection): Promise<Detection> {
    const id = this.detectionId++;
    const newDetection: Detection = {
      ...detection,
      id,
      processedAt: new Date(),
    };
    this.detectionRecords.set(id, newDetection);
    return newDetection;
  }

  async getDetection(id: number): Promise<Detection | undefined> {
    return this.detectionRecords.get(id);
  }

  async getLatestDetections(limit = 10): Promise<Detection[]> {
    return Array.from(this.detectionRecords.values())
      .sort((a, b) => b.processedAt.getTime() - a.processedAt.getTime())
      .slice(0, limit);
  }

  // Processed image cache
  async saveProcessedImage(data: ProcessedImage): Promise<ProcessedImage> {
    this.processedImages.set(data.id, data);
    return data;
  }

  async getProcessedImage(id: string): Promise<ProcessedImage | undefined> {
    return this.processedImages.get(id);
  }
}

export const storage = new MemStorage();
