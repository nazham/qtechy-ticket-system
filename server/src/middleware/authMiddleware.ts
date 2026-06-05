import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// 1. Extend the Express Request interface
export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
}

// 2. Authentication Middleware (Who are you?)
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token signature
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      // Fetch user from DB and attach to request (excluding the password)
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res
          .status(401)
          .json({
            success: false,
            message: "User belonging to this token no longer exists",
          });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res
        .status(401)
        .json({
          success: false,
          message: "Not authorized, token failed or expired",
        });
    }
  } else {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token provided" });
  }
};

// 3. Authorization Middleware (What can you do?)
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Role (${req.user?.role}) is not allowed to access this resource`,
      });
      return;
    }
    next();
  };
};
