import mongoose from "mongoose";
import { beforeAll, afterAll } from "@jest/globals";

process.env.NODE_ENV = "test";
process.env.MONGO_TEST_URI =
  "mongodb://127.0.0.1:27017/supporthub_test";

// Patch TypedArrays Symbol.hasInstance using Object.prototype.toString to support cross-realm checks in Jest (e.g. onnxruntime-node native tensors)
const typedArrays = [
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  BigInt64Array,
  BigUint64Array,
];

for (const TypedArray of typedArrays) {
  Object.defineProperty(TypedArray, Symbol.hasInstance, {
    value: (instance: unknown) =>
      Object.prototype.toString.call(instance) === `[object ${TypedArray.name}]`,
    configurable: true,
  });
}

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
