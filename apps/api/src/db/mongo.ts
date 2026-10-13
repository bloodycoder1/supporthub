import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../config/logger";

export async function connectMongo(): Promise<void> {
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  logger.info("MongoDB connected");
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

export async function pingMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error("MongoDB not connected");
  }
  await mongoose.connection.db.admin().ping();
}
