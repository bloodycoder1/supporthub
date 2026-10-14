
import type { Request, Response, NextFunction } from "express";
import { registerSchema } from "./auth.validation";
import { AuthError, registerUser } from "./auth.service";
import { loginSchema } from "./auth.validation";
import { loginUser } from "./auth.service";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
      return;
    }

    const user = await registerUser(result.data);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user }
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
      return;
    }

    next(error);
  }
}


export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
      return;
    }

    const data = await loginUser(result.data);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
      return;
    }

    next(error);
  }
}
