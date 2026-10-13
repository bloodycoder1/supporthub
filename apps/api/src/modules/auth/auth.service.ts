
import bcrypt from "bcryptjs";
import { UserModel } from "./auth.model.js";
import type { RegisterInput } from "./auth.validation.js";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await UserModel.exists({
    email: input.email
  });

  if (existingUser) {
    throw new AuthError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  } catch (error: unknown) {
    // Handle concurrent registration attempts for the same email.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new AuthError("Email is already registered", 409);
    }

    throw error;
  }
}
