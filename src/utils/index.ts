import bcrypt from "bcrypt";
import { environment } from "../config";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";

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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const generateTransactionReference = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  return `${timestamp}${randomNum}`;
};
