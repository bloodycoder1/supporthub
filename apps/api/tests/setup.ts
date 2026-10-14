
import mongoose from "mongoose";
import { beforeAll, afterAll } from "@jest/globals";

process.env.NODE_ENV = "test";
process.env.MONGO_TEST_URI =
  "mongodb://127.0.0.1:27017/supporthub_test";

beforeAll(async () => {
  const mongoUri = process.env.MONGO_TEST_URI;

  if (!mongoUri) {
    throw new Error("MONGO_TEST_URI is missing");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});
