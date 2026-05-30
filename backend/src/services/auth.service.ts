import { OAuth2Client } from "google-auth-library";
import prisma from "../utils/db";
import { generateToken } from "../utils/jwt";
import { env } from "../config/env";
import { normalizePhoneNumber, validatePhoneNumber } from "../utils/phone.utils";
import { AuthResponse } from "../types/auth.types";
import * as otpService from "./otp.service";
import auditService from "./audit.service";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Issue a JWT + DB session for an authenticated user and return the login
 * payload. Shared by OTP login and Google login so the session contract
 * stays identical regardless of how the user authenticated.
 */
const issueSession = async (
  user: { id: string; email: string; phone: string | null; role: string },
  method: "EMAIL" | "SMS" | "GOOGLE"
): Promise<AuthResponse> => {
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Resolve role-specific id
  let studentId: string | null = null;
  let teacherId: string | null = null;
  let parentId: string | null = null;

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    studentId = student?.id || null;
  } else if (user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    teacherId = teacher?.id || null;
  } else if (user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    parentId = parent?.id || null;
  }

  // Note: email/teacherId are intentionally NOT in the token (unused + email is
  // PII in a readable payload). They still go in the response for the frontend.
  const token = generateToken({
    userId: user.id,
    role: user.role,
    studentId,
    parentId,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.session.create({
    data: { userId: user.id, token, expiresAt, userAgent: null },
  });

  await auditService.createLog({
    userId: user.id,
    action: "LOGIN",
    newValues: { method, role: user.role },
  });

  return {
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        studentId,
        teacherId,
        parentId,
      },
    },
  };
};
/**
 * Request OTP code for login
 */
export const requestOTP = async (
  identifier: string,
  method: "email" | "sms"
) => {
  // Find user by email or phone
  const isEmail = identifier.includes("@");

  // Normalize phone number if SMS login
  let searchIdentifier = identifier;
  if (!isEmail) {
    try {
      searchIdentifier = normalizePhoneNumber(identifier);
      if (!validatePhoneNumber(identifier)) {
        throw new Error("Invalid phone number format");
      }
    } catch (error: any) {
      throw new Error(error.message || "Invalid phone number");
    }
  }

  // ✅ FIX: Make email case-insensitive and normalize phone
  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: { equals: searchIdentifier, mode: 'insensitive' } }
      : { phone: searchIdentifier },
  });

  console.log(`[auth] requestOTP identifier=${identifier} method=${method} userFound=${!!user} isActive=${user?.isActive ?? 'n/a'} otpEnabled=${env.OTP_ENABLED}`);

  if (!user) {
    throw new Error("No account found with that email or phone.");
  }
  if (!user.isActive) {
    throw new Error("This account is deactivated. Please contact an administrator.");
  }

  // Generate, store, and deliver the OTP (handles resend cooldown + channel).
  // Skipped entirely when OTP_ENABLED=false — login then no-ops the code check.
  if (env.OTP_ENABLED) {
    await otpService.sendOtp({
      userId: user.id,
      recipient: identifier,
      method,
    });
  }

  return {
    success: true,
    message: `An OTP has been sent to your ${method}.`,
  };
};

/**
 * Verify OTP and login user
 */
export const verifyOTP = async (identifier: string, code: string) => {
  // Find user
  const isEmail = identifier.includes("@");

  // Normalize phone number if SMS login
  let searchIdentifier = identifier;
  if (!isEmail) {
    try {
      searchIdentifier = normalizePhoneNumber(identifier);
    } catch (error: any) {
      throw new Error(error.message || "Invalid phone number");
    }
  }

  // ✅ FIX: Make email case-insensitive and normalize phone
  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: { equals: searchIdentifier, mode: 'insensitive' } }
      : { phone: searchIdentifier },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify the submitted code (enforces expiry, attempt limit, and consumes it).
  // Skipped when OTP_ENABLED=false — any code is accepted (dev / staging).
  if (env.OTP_ENABLED) {
    await otpService.verifyOtp(user.id, code);
  }

  return issueSession(user, isEmail ? "EMAIL" : "SMS");
};

/**
 * Login with a Google ID token (staff only).
 * Verifies the token against Google, requires a verified email that matches an
 * existing ADMIN/TEACHER account. Students/parents keep OTP-only login.
 */
export const loginWithGoogle = async (idToken: string) => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error("Google sign-in is not configured");
  }

  // Verify the ID token signature, audience, issuer and expiry with Google.
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new Error("Invalid Google credential");
  }

  if (!payload?.email || !payload.email_verified) {
    throw new Error("Google account email is not verified");
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: payload.email, mode: "insensitive" } },
  });

  // Generic rejection to avoid revealing which emails are registered.
  if (!user || !user.isActive) {
    throw new Error("No staff account is linked to this Google account");
  }

  // Google sign-in is restricted to staff. Students/parents use OTP.
  if (user.role !== "ADMIN" && user.role !== "TEACHER") {
    throw new Error("Google sign-in is only available for staff accounts");
  }

  return issueSession(user, "GOOGLE");
};

/**
 * Logout user
 */
export const logout = async (token: string) => {
  // Find session first to get userId
  const session = await prisma.session.findUnique({
    where: { token },
    select: { userId: true }
  });

  if (session) {
    // ✅ LOG AUDIT EVENT
    await auditService.createLog({
      userId: session.userId,
      action: 'LOGOUT',
      newValues: { token: token.substring(0, 10) + '...' }
    });
  }

  // Delete session
  await prisma.session.deleteMany({
    where: { token },
  });

  return {
    success: true,
    message: "Logout successful",
  };
};

/**
 * Get current user info
 */
export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get role-specific data
  let roleData: any = {};

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      include: {
        parentStudentLinks: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    });
    roleData.student = student;
  } else if (user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });
    roleData.teacher = teacher;
  } else if (user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      include: {
        parentStudentLinks: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                secondName: true,
                thirdName: true,
                cpr: true,
                email: true,
                currentLevel: true,
                dateOfBirth: true,
                gender: true,
                isActive: true,
              }
            }
          }
        }
      }
    });
    roleData.parent = parent;
  }

  return {
    success: true,
    data: {
      ...user,
      ...roleData
    },
  };
};