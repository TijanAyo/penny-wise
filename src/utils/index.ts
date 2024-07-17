import bcrypt from "bcrypt";
import { environment } from "../config";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { format } from "date-fns";

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

export const generateRandomOTP = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
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

export const generateTransactionReference = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  return `${timestamp}${randomNum}`;
};
