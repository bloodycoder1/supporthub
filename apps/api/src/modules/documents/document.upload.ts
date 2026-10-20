
import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { documentUploadLimits } from "./document.validation";

const uploadDirectory = path.resolve(
  process.cwd(),
  "private_uploads",
);

const allowedMimeTypes = new Set<string>(
  documentUploadLimits.allowedMimeTypes,
);

export const documentUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      mkdir(uploadDirectory, { recursive: true })
        .then(() => callback(null, uploadDirectory))
        .catch((error: NodeJS.ErrnoException) =>
          callback(error, uploadDirectory),
        );
    },

    filename: (_req, _file, callback) => {
      callback(null, randomUUID());
    },
  }),

  limits: {
    fileSize: documentUploadLimits.maxFileSizeBytes,
    files: 1,
    fields: 5,
    parts: 6,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new Error("Only PDF, TXT, and Markdown files are allowed"),
      );
      return;
    }

    callback(null, true);
  },
});

export function uploadSingleDocument(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  documentUpload.single("file")(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";

      res.status(tooLarge ? 413 : 400).json({
        success: false,
        message: tooLarge
          ? "Document exceeds the 5 MB limit"
          : "Invalid document upload",
      });
      return;
    }

    if (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Invalid document upload",
      });
      return;
    }

    next();
  });
}
