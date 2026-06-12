import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "./errorHandler";

const validateRequest =
  (target: "body" | "query" | "params") =>
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      Object.defineProperty(req, target, {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
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

/**
 * Generic Zod validation middleware factory for req.body.
 * Usage: router.post("/route", validate(mySchema), handler)
 */
export const validate = validateRequest("body");

/**
 * Generic Zod validation middleware factory for req.query.
 * Usage: router.get("/route", validateQuery(mySchema), handler)
 */
export const validateQuery = validateRequest("query");

/**
 * Generic Zod validation middleware factory for req.params.
 * Usage: router.get("/route/:id", validateParams(mySchema), handler)
 */
export const validateParams = validateRequest("params");
