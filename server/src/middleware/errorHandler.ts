import { NextFunction, Request, Response } from "express";

/**
 * Custom operational error with an HTTP status code.
 * Throw this in controllers/services for known error conditions.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handling middleware.
 * Must be registered AFTER all routes: `app.use(errorHandler)`
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log errors safely — stack traces only in non-production
  if (process.env.NODE_ENV !== "production") {
    process.stderr.write(`[ERROR] ${err.message}\n${err.stack ?? ""}\n`);
  } else {
    process.stderr.write(`[ERROR] ${err.message}\n`);
  }

  let statusCode = err instanceof AppError ? err.statusCode : 500;
  let message = err instanceof AppError ? err.message : "Internal Server Error";

  // Handle Mongoose/MongoDB CastError (e.g. invalid ObjectId format)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format for ${(err as any).path || "parameter"}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
