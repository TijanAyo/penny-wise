import { injectable } from "tsyringe";
import User from "../models/user.model";
import { badRequestException } from "../helpers";
import redisClient from "../config/redis";
import { cryptHash } from "../utils";
import { Types } from "mongoose";

@injectable()
export class UserRepository {
  async findByEmail(email: string) {
    try {
      return await User.findOne({ emailAddress: email });
    } catch (err: any) {
      console.error("Error looking up user by email:", err);
      throw err;
    }
  }

  async findByUserId(userId: Types.ObjectId) {
    try {
      return await User.findById({ _id: userId });
    } catch (err: any) {
      console.error("Error looking up user by ID:", err);
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

  async updateFieldInDB(email: string, updateData: Record<string, any>) {
    try {
      const update = await User.findOneAndUpdate(
        { emailAddress: email },
        { $set: updateData },
      );
      if (!update)
        throw new badRequestException(
          "An error occurred while performing update",
        );

      return;
    } catch (err: any) {
      console.log(`Error updating field in DB`);
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
      const user = await User.findOneAndUpdate(
        { emailAddress: email },
        { password },
      );

      if (!user) throw new badRequestException("Password could not be saved");

      return;
    } catch (err: any) {
      console.error("Error updating user password", err);
      throw err;
    }
  }

  async storeOTP(email: string, otp_code: string) {
    try {
      const hashEmail = await cryptHash(email);
      let redisKey = `otp_validation:${hashEmail}`;
      let otpExpiresIn = Date.now() + 15 * 60 * 1000; // 15 min

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

  private async retrieveOTP(email: string) {
    try {
      const hashEmail = await cryptHash(email);
      let redisKey = `otp_validation:${hashEmail}`;

      const [otp, isValidated, otpExpiresIn] = await Promise.all([
        redisClient.HGET(redisKey, "otp"),
        redisClient.HGET(redisKey, "isValidated"),
        redisClient.HGET(redisKey, "otpExpiresIn"),
      ]);

      console.log(otp, isValidated, otpExpiresIn);

      return {
        otpCode: otp ?? null,
        isValidated: isValidated ?? null,
        otpExpiresIn: otpExpiresIn ?? null,
      };
    } catch (err: any) {
      console.error("Error retrieving otp values from redis database", err);
      throw err;
    }
  }

  async validateOTP(email: string, providedOTP: string) {
    try {
      const otpDetails = await this.retrieveOTP(email);

      if (!otpDetails.otpCode) {
        throw new badRequestException("OTP not found");
      }
      const currentTime = Date.now();
      const otpExpiresIn = parseInt(otpDetails.otpExpiresIn, 10);

      if (otpDetails.isValidated === "true") {
        throw new badRequestException(
          "Invalid OTP code, code has been utilized",
        );
      }

      if (currentTime > otpExpiresIn) {
        throw new badRequestException("OTP code has expired");
      }

      if (otpDetails.otpCode !== providedOTP) {
        throw new badRequestException("Invalid OTP code");
      }

      return true;
    } catch (err: any) {
      console.error("Error validating otp in redis database", err);
      throw err;
    }
  }

  async markOTPHasValidated(email: string) {
    try {
      const hashEmail = await cryptHash(email);
      let redisKey = `otp_validation:${hashEmail}`;
      const updateField = await redisClient.HSET(redisKey, {
        isValidated: "true",
      });

      if (updateField !== 0) {
        throw new badRequestException("OTP could not be marked has validated");
      }

      return;
    } catch (err: any) {
      console.error("Error marking otp has valid");
      throw err;
    }
  }
}
