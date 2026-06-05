import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../middleware/errorHandler";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { UserRole } from "../constants/enums";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      throw new AppError("Please provide all required fields", 400);
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError("User already exists", 400);
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3.5 Check if this is the first user
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? UserRole.Admin : UserRole.User;

    // 4. Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (!user) {
      throw new AppError("Invalid user data received", 400);
    }

    // 5. Send success response with token (toJSON strips password automatically)
    res.status(201).json({
      success: true,
      data: {
        ...user.toJSON(),
        token: generateToken(user.id, user.role),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    // 4. Send response (toJSON strips password automatically)
    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        token: generateToken(user.id, user.role),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (Requires Token)
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  // If the code reaches here, the protect middleware has already validated the token and attached the user to req.user.
  res.status(200).json({
    success: true,
    data: req.user,
  });
};