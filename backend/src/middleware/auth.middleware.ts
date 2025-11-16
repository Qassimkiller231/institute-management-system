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
    console.log("🔍 Authorization header:", authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    // 🔍 DEBUG #2: see extracted token
  console.log("🔍 Extracted token:", token);

  // 🔍 DEBUG #3: verify environment variable
  console.log("🔍 JWT_SECRET length:", process.env.JWT_SECRET?.length);
    // Verify token
    const decoded = verifyToken(token);
     console.log("🔍 Decoded token payload:", decoded);

    // Check if session exists in database
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      console.error("❌ JWT verification error:");
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

    // Attach user to request
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
