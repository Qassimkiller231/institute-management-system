import { randomInt } from "crypto";
import prisma from "../utils/db";
import * as smsService from "./sms.service";
import * as emailService from "./email.service";

/**
 * OTP service: owns the full one-time-password lifecycle — generate, store,
 * deliver (via the SMS or email service), and verify.
 *
 * Lives in the service layer (not utils) so it can depend on the sms/email
 * services and Prisma without inverting the dependency direction.
 */

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_MS = 60_000; // 1 minute between resends

/**
 * Generate a 6-digit code. In development it's fixed to 123456 so local logins
 * work without real SMS/email delivery; in production it uses a CSPRNG.
 */
function generateCode(): string {
  if (process.env.NODE_ENV === "development") {
    return "123456";
  }
  return randomInt(100000, 1000000).toString();
}

/**
 * Create, store, and deliver an OTP for a user over the chosen channel.
 * Throws if a recent OTP was already sent (resend cooldown).
 */
export const sendOtp = async (params: {
  userId: string;
  recipient: string; // the email address or phone number to deliver to
  method: "email" | "sms";
}): Promise<void> => {
  const { userId, recipient, method } = params;

  // Resend cooldown: block a new code while a recent one is still valid.
  const recentOtp = await prisma.otpCode.findFirst({
    where: {
      userId,
      isUsed: false,
      expiresAt: { gt: new Date() },
      createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    },
  });

  if (recentOtp) {
    throw new Error("OTP already sent. Please wait before requesting a new one.");
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await prisma.otpCode.create({
    data: { userId, code, expiresAt, isUsed: false, attempts: 0 },
  });

  // Deliver over the requested channel. Never log the code itself.
  if (method === "sms") {
    await smsService.sendOTP({ phone: recipient, code, userId });
  } else {
    await emailService.sendOtpEmail({
      to: recipient,
      name: "User", // user profile isn't loaded at request time
      otpCode: code,
      expiryMinutes: OTP_TTL_MINUTES,
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[dev] OTP generated and sent via ${method}.`);
  }
};

/**
 * Verify a submitted code against the user's latest active OTP.
 * Enforces expiry and an attempt limit, then consumes the code.
 * Throws on invalid / expired / locked; resolves on success.
 */
export const verifyOtp = async (userId: string, code: string): Promise<void> => {
  // Fetch the latest unused OTP WITHOUT matching on the code, so that wrong
  // guesses are counted (matching on code made the lockout unreachable).
  const otpRecord = await prisma.otpCode.findFirst({
    where: { userId, isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw new Error("Invalid or expired OTP code");
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    // Burn the code so a fresh one must be requested.
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    throw new Error("Maximum OTP attempts exceeded. Please request a new code.");
  }

  if (otpRecord.code !== code) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("Invalid OTP code");
  }

  // Correct code: consume it.
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });
};
