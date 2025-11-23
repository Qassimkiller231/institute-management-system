import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret =
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  studentId?: string | null;  // ✅ Add these
  teacherId?: string | null;  // ✅
  parentId?: string | null;   // ✅
}

/**
 * Generate JWT token
 */
export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    // 👇 cast to satisfy the typing
    expiresIn: JWT_EXPIRES_IN as any,
  };

  return jwt.sign(payload as any, JWT_SECRET, options);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode JWT token without verification (for debugging)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};