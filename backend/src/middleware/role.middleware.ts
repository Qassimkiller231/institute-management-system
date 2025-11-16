import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
/**
 * Middleware to check if user has required role
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Shortcut middleware for admin-only routes
 */
export const requireAdmin = requireRole(['ADMIN']);

/**
 * Shortcut middleware for teacher or admin routes
 */
export const requireTeacherOrAdmin = requireRole(['TEACHER', 'ADMIN']);
