import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "./errorHandler";

/**
 * Generic Zod validation middleware factory.
 * Usage: router.post("/route", validate(mySchema), handler)
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // parse() throws ZodError on failure and mutates req.body with the
      // cleaned/coerced output (e.g. trimmed strings, lowercased email)
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        next(new AppError(message, 400));
      } else {
        next(error);
      }
    }
  };
