import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { UserRole } from "../constants/enums";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const filter: any = {};
    
    // Optionally filter by role if provided in query (supporting case-insensitivity)
    if (req.query.role) {
      const roleStr = String(req.query.role).toLowerCase();
      if (roleStr === "admin") {
        filter.role = UserRole.Admin;
      } else if (roleStr === "agent") {
        filter.role = UserRole.Agent;
      } else if (roleStr === "user") {
        filter.role = UserRole.User;
      } else {
        filter.role = req.query.role;
      }
    }

    const users = await User.find(filter).select("-password").sort({ name: 1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};
