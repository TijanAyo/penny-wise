import { injectable } from "tsyringe";
import { Types } from "mongoose";
import Wallet from "../models/wallet.model";
import { badRequestException, logger } from "../helpers";
import redisClient from "../config/redis";

@injectable()
export class WalletRepository {
  async createWallet(
    userId: Types.ObjectId,
    updateData: {
      account_number: string;
      account_bank: string;
      balance: number;
    },
  ) {
    try {
      const new_wallet = await Wallet.create({
        user: userId,
        account_number: updateData.account_number,
        account_bank: updateData.account_bank,
        balance: 0,
      });
      if (!new_wallet)
        throw new badRequestException(
          "An error occurred while performing update on wallet",
        );

      return;
    } catch (err: any) {
      console.error("Error updating user wallet info:", err);
      throw err;
    }
  }

  async getWalletInfo(userId: Types.ObjectId) {
    try {
      return await Wallet.findOne({ user: userId }).populate(
        "user",
        "firstName lastName emailAddress username",
      );
    } catch (err: any) {
      console.error("Error getting user wallet info:", err);
      throw err;
    }
  }

  async incrementBalance(userId: Types.ObjectId, amount: number) {
    try {
      return await Wallet.findOneAndUpdate(
        { user: userId },
        { $inc: { balance: amount } },
      );
    } catch (err: any) {
      console.error("Error increasing wallet balance:", err);
      throw err;
    }
  }

  async decreaseBalance(userId: Types.ObjectId, amount: number) {
    try {
      return await Wallet.findOneAndUpdate(
        { user: userId },
        { $inc: { balance: -amount } },
      );
    } catch (err: any) {
      console.error("Error increasing wallet balance:", err);
      throw err;
    }
  }

  async storeTransactionRef(ref: string, user_email: string) {
    try {
      let key = ref;
      const TTL = 86400; // 24 hours

      await redisClient.HSET(key, {
        email: user_email,
      });

      await redisClient.expire(key, TTL);
    } catch (err: any) {
      console.log("Error storing reference in redis db", err);
      throw err;
    }
  }

  async retrieveTransactionRef(key: string) {
    try {
      const transaction_val = await redisClient.HGET(key, "email");
      return { data: transaction_val ?? null };
    } catch (err: any) {
      console.error("Error retrieving ref values from redis db", err);
      throw err;
    }
  }
}
