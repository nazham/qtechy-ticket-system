import z from "zod";

/**
 * Reusable Zod schema for a valid MongoDB ObjectId string (24-char hex).
 * Use this anywhere you need to validate an ObjectId parameter, body field, or query value.
 */
export const objectIdString = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");
