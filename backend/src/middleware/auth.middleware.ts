import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types/auth.types';
import prisma from '../utils/db';

/**
 * Middleware to authenticate requests using JWT token
 * Usage: app.get('/protected-route', authenticate, handler)
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token signature/expiry
    const decoded = verifyToken(token);

    // Check if session exists in database
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

    // Check if user is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    // If the token's role no longer matches the DB (e.g. an admin changed it),
    // force re-login so the frontend and backend never authorize on different
    // roles. The frontend turns this 401 into a redirect to /session-expired.
    if (decoded.role !== user.role) {
      return res.status(401).json({
        success: false,
        message: 'Your session is out of date. Please log in again.',
        code: 'ROLE_CHANGED',
      });
    }

    // Attach user to request.
    req.user = decoded;

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to check if user has required role
 * Usage: app.get('/admin-only', authenticate, authorize(['ADMIN']), handler)
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};
