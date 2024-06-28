import { injectable } from "tsyringe";
import User from "../models/user.model";
import { badRequestException } from "../helpers";
import redisClient from "../config/redis";
import { cryptHash } from "../utils";

@injectable()
export class AuthRepository {
  async findByEmail(email: string) {
    try {
      return await User.findOne({ emailAddress: email });
    } catch (err: any) {
      console.error("Error looking up user by email:", err);
      throw err;
    }
  }

  async findByPhoneNumber(phoneNumber: string) {
    try {
      return await User.findOne({ phoneNumber });
    } catch (err: any) {
      console.error("Error looking up user by phone-number:", err);
      throw err;
    }
  }

  async findByUsername(username: string) {
    try {
      return await User.findOne({ username });
    } catch (err: any) {
      console.error("Error looking up user by username:", err);
      throw err;
    }
  }

  async createUser(
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    password: string,
  ) {
    try {
      const user = await User.create({
        emailAddress: email,
        firstName,
        lastName,
        phoneNumber,
        password,
      });

      if (!user) throw new badRequestException("User could not be created");

      return user;
    } catch (err: any) {
      console.error("Error creating user:", err);
      throw err;
    }
  }

  async updatePassword(email: string, password: string) {
    try {
      const user = await User.findOneAndUpdate({
        emailAddress: email,
        password,
      });

      if (!user) throw new badRequestException("Password could not be saved");

      return true;
    } catch (err: any) {
      console.error("Error updating user password", err);
      throw err;
    }
  }

  async storeOTP(email: string, otp_code: string) {
    try {
      const hashEmail = await cryptHash(email);
      let redisKey = `otp_validation:${hashEmail}`;
      let otpExpiresIn = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      // Store OTP and validation status in a hash
      await redisClient.HSET(redisKey, {
        otp: otp_code,
        isValidated: "false",
        otpExpiresIn: String(otpExpiresIn),
      });

      // TTL 1hour
      await redisClient.expire(redisKey, 3600);
    } catch (err: any) {
      console.error("Error storing otp in redis database", err);
      throw err;
    }
  }

  async validateOTP(email: string, otp_code: string) {
    try {
      const hashEmail = await cryptHash(email);
      let redisKey = `otp_validation:${hashEmail}`;

      const [otpCode, isValidated, otpExpiresIn] = await Promise.all([
        redisClient.HGET(redisKey, "otpCode"),
        redisClient.HGET(redisKey, "isValidated"),
        redisClient.HGET(redisKey, "otpExpiresIn"),
      ]);

      console.log(otpCode, isValidated, otpExpiresIn);

      // check if the code has not expired
      // - return OTP code has expired
      // check if the code matches
      // - Invalid OTP Code

      // check if this code has been used isValidated is true
      // - Invalida OTP code, code has been utilized

      // return true
    } catch (err: any) {
      console.error("Error validating otp in redis database", err);
      throw err;
    }
  }
}
