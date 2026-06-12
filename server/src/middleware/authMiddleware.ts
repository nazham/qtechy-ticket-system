import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { AppError } from "./errorHandler";
import { Permission, ROLE_PERMISSIONS, UserRole } from "../constants/enums";

// 1. Extend the Express Request interface
export interface AuthRequest extends Request {
  user?: IUser;
}

// Strictly typed AuthenticatedRequest where user must be present (eliminates non-null assertions)
export interface AuthenticatedRequest extends Request {
  user: IUser;
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

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // Fetch user from DB and attach to request (excluding the password)
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new AppError("User belonging to this token no longer exists", 401));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new AppError("Not authorized, token failed or expired", 401));
    }
  } else {
    return next(new AppError("Not authorized, no token provided", 401));
  }
};

export const authorizePermissions = (...requiredPermissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Not authorized, user not found", 401));
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_PERMISSIONS[userRole];
    if (!userPermissions) {
      process.stderr.write(
        `[RBAC] Unknown role "${userRole}" for user ${req.user._id} — denying all permissions\n`,
      );
      return next(new AppError("Not authorized to access this resource", 403));
    }

    const hasPermission = requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasPermission) {
      return next(new AppError("Not authorized to access this resource", 403));
    }

    next();
  };
};
