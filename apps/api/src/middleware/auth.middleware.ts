
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication token is required"
    });
    return;
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
      return;
    }

    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token"
    });
  }
}
