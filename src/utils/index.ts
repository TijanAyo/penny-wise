import bcrypt from "bcrypt";
import { environment } from "../config";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { format } from "date-fns";
import { randomUUID } from "crypto";

export const hashPayload = async (data: string) => {
  const salt = Number(environment.SALT_ROUND);
  if (isNaN(salt)) {
    throw new Error("Invalid SALT environment variable");
  }
  return await bcrypt.hash(data, Number(environment.SALT_ROUND));
};

export const compareHash = async (payload: string, hashedPayload: string) => {
  return await bcrypt.compare(payload, hashedPayload);
};

export const generateAccessToken = async (userId: string) => {
  const payload = { userId };
  return jwt.sign(payload, environment.JWT_SECRET, {
    expiresIn: environment.JWT_EXPIRES_IN,
  });
};

/**
 * @desc 'Generate a random 6 digit number'
 * @returns
 */
export const generateRandomOTP = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

/**
 * @desc 'Generate a random code based off provided length'
 * @param codeLen
 * @returns
 */
export const generateRandomCodeOTP = (codeLen: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let otp = "";
  for (let i = 0; i < codeLen; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
};

export const cryptHash = async (data: string) => {
  return createHash("sha256").update(data).digest("hex");
};

export const generateVerificationURL = async (uid: string) => {
  const payload = { uid };
  return jwt.sign(payload, environment.JWT_SECRET, {
    expiresIn: "30m",
  });
};

export const formatDate = (date: Date) => {
  return format(date, "yyyy-MM-dd HH:mm:ss");
};

export const generateTransactionReference = (prefix?: string) => {
  const prfx = prefix ?? environment.APP_NAME;
  const timestamp = Date.now();
  const uniqueValue = randomUUID();

  return `${prfx}_${uniqueValue}_${timestamp}`;
};
