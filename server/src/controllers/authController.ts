import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
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
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};
