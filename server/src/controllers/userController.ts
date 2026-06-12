import { NextFunction, Response } from "express";
import { UserRole } from "../constants/enums";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../middleware/errorHandler";
import {
  getUsersService,
  changeUserServiceRole,
  getUsersDirectoryService,
  deleteUserService,
} from "../services/userService";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const roleQuery = req.query.role ? String(req.query.role) : undefined;
    const users = await getUsersService(roleQuery);
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote user to Agent
// @route   PUT /api/users/:id/promote
// @access  Private/Admin
export const promoteToAgent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Not authorized, user not found", 401);
    }
    const user = await changeUserServiceRole(
      req.params.id as string,
      String(req.user._id),
      UserRole.Agent,
      "User is already an Agent",
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Demote Agent to User
// @route   PUT /api/users/:id/demote
// @access  Private/Admin
export const demoteToUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Not authorized, user not found", 401);
    }
    const user = await changeUserServiceRole(
      req.params.id as string,
      String(req.user._id),
      UserRole.User,
      "User is already a User",
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with directory metadata (e.g. active ticket counts)
// @route   GET /api/users/directory
// @access  Private/Admin
export const getUsersDirectory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await getUsersDirectoryService();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Not authorized, user not found", 401);
    }
    const user = await deleteUserService(req.params.id as string, String(req.user._id));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
