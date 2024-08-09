import bcrypt from "bcrypt";
import { environment, BankData } from "../config";
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
 * @desc 'Generate a random code digit number based off the provided length'
 * @returns
 */
export const generateRandomOTP = (codeLen: number) => {
  const min = Math.pow(10, codeLen - 1);
  const max = Math.pow(10, codeLen) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1));

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

export const generateTransactionReference = (prefix?: string) => {
  const prfx = prefix ?? environment.APP_NAME;
  const timestamp = Date.now();
  const uniqueValue = randomUUID();

  return `${prfx}_${uniqueValue}_${timestamp}`;
};

export const getBankCode = (bankName: string) => {
  const bank = BankData.find(
    (b) => b.name.toLowerCase() === bankName.toLowerCase(),
  );
  return bank ? bank.code : null;
};
