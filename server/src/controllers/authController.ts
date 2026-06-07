import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { loginUserService, registerUserService } from "../services/authService";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await registerUserService(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await loginUserService(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user;
  res.status(200).json({ success: true, data: user });
};
