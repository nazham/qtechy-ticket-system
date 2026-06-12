import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { seedDatabase, sweepDatabase } from "../services/adminService";

/**
 * POST /api/admin/seed
 * Admin-only: wipes DB and inserts seed data.
 */
export const seedDb = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await seedDatabase();
    res.status(201).json({
      success: true,
      message: `Database seeded successfully.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/sweep
 * Admin-only: deletes all users and tickets from the database.
 */
export const sweepDb = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await sweepDatabase();
    res.status(200).json({
      success: true,
      message: `Database swept clean.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
