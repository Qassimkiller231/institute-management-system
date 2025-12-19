import prisma from "../utils/db";
import { generateToken } from "../utils/jwt";
import {
  generateOTP,
  getOTPExpiration,
  isOTPExpired,
  sendOTP,
} from "../utils/otp";
import { normalizePhoneNumber, validatePhoneNumber } from "../utils/phone.utils";
import * as smsService from "./sms.service";
import * as emailService from "./email.service";
import auditService from "./audit.service";
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

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive");
  }

  // Check if there's a recent unused OTP (within last minute)
  const recentOTP = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      isUsed: false,
      expiresAt: { gt: new Date() },
      createdAt: { gt: new Date(Date.now() - 60000) }, // Last 1 minute
    },
  });

  if (recentOTP) {
    throw new Error(
      "OTP already sent. Please wait before requesting a new one."
    );
  }

  // Generate new OTP
  const code = generateOTP();
  const expiresAt = getOTPExpiration();

  // Save OTP to database
  await prisma.otpCode.create({
    data: {
      userId: user.id,
      code,
      expiresAt,
      isUsed: false,
      attempts: 0,
    },
  });

  // Send OTP (simulated for now)
  const recipient = method === "email" ? user.email : user.phone || "";
  await sendOTP(recipient, code, method);

  if (method === "sms") {
    // Send via SMS
    await smsService.sendOTP({
      phone: identifier,
      code: code,
      userId: user.id,
    });
  } else {
    // Send via email(existing code)
    // await emailService.sendOtpEmail({
    //   to: identifier,
    //   name: "guest",
    //   otpCode: code,
    //   expiryMinutes: 1,
    // });
  }

  return {
    success: true,
    message: `OTP sent to ${method === "email" ? "email" : "phone"}`,
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

  // Find OTP code
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      code,
      isUsed: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new Error("Invalid OTP code");
  }

  // Check if OTP expired
  if (isOTPExpired(otpRecord.expiresAt)) {
    throw new Error("OTP code has expired");
  }

  // Check attempts (max 3)
  if (otpRecord.attempts >= 3) {
    throw new Error("Maximum OTP attempts exceeded");
  }

  // Increment attempts
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { attempts: otpRecord.attempts + 1 },
  });

  // Mark OTP as used
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Get role-specific ID
  let studentId = null;
  let teacherId = null;
  let parentId = null;

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

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    studentId,
    teacherId,
    parentId,
  });

  // Create session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      userAgent: null,
    },
  });

  // ✅ LOG AUDIT EVENT
  await auditService.createLog({
    userId: user.id,
    action: 'LOGIN',
    newValues: { method: isEmail ? 'EMAIL' : 'SMS', role: user.role }
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