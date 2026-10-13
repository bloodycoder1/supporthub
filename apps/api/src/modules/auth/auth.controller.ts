
import type { Request, Response, NextFunction } from "express";
import { registerSchema } from "./auth.validation.js";
import { AuthError, registerUser } from "./auth.service.js";

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
