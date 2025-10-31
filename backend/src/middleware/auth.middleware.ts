import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError, AuthorizationError } from "../common/exceptions";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("No token provided");
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || "default_secret";

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
        email: string;
        role: string;
      };

      req.user = decoded;
      next();
    } catch (error) {
      throw new AuthenticationError("Invalid or expired token");
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError("User not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError("Insufficient permissions"));
    }

    next();
  };
};

// Admin-only middleware
export const adminOnly = authorize("ADMIN", "SUPER_ADMIN");

// Super admin-only middleware
export const superAdminOnly = authorize("SUPER_ADMIN");
