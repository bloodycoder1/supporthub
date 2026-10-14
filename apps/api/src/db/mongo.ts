import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../config/logger";


const mongoUrl =
  process.env.NODE_ENV === "test"
    ? process.env.MONGO_TEST_URI
    : env.MONGO_URI;

if (!mongoUrl) {
  throw new Error("MongoDB connection URI is missing");
}
export async function connectMongo(): Promise<void> {
  await mongoose.connect(mongoUrl!, { serverSelectionTimeoutMS: 5000 });
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
