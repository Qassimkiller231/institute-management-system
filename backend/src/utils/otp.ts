/**
 * Generate a random 6-digit OTP code
 */
export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

/**
 * Calculate OTP expiration time (5 minutes from now)
 */
export const getOTPExpiration = (): Date => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);
  return expiresAt;
};

/**
 * Check if OTP has expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

/**
 * Simulate sending OTP via SMS/Email
 * In production, integrate with SMS service (Twilio, AWS SNS, etc.)
 */
export const sendOTP = async (
  recipient: string,
  code: string,
  method: 'email' | 'sms'
): Promise<boolean> => {
  console.log(`
╔════════════════════════════════════╗
║        OTP CODE (${method.toUpperCase()})           ║
╠════════════════════════════════════╣
║  Recipient: ${recipient.padEnd(20)}║
║  Code: ${code}                      ║
║  Expires: 5 minutes                ║
╚════════════════════════════════════╝
  `);

  // In production, replace with actual SMS/Email service:
  // if (method === 'email') {
  //   await sendEmail(recipient, code);
  // } else {
  //   await sendSMS(recipient, code);
  // }

  return true;
};
