
import bcrypt from "bcryptjs";
import { UserModel } from "./auth.model";
import type { RegisterInput } from "./auth.validation";
import jwt from "jsonwebtoken";
import type { LoginInput } from "./auth.validation";
import { env } from "../../config/env";

export async function loginUser(input: LoginInput) {
  const user = await UserModel.findOne({
    email: input.email
  }).select("+passwordHash");

  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AuthError("Invalid email or password", 401);
  }

  const accessToken = jwt.sign(
    { sub: user.id },
    env.JWT_SECRET!,
    { expiresIn: "15m", algorithm: "HS256" }
  );

  return {
    accessToken,
    tokenType: "Bearer",
    expiresIn: 900,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
}


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
