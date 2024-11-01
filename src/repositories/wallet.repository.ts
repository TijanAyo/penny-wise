import { injectable, inject, delay } from "tsyringe";
import mongoose, { Types } from "mongoose";
import Wallet from "../models/wallet.model";
import { badRequestException } from "../helpers";
import redisClient from "../config/redis";
import { TransactionRepository } from "./transaction.repository";
import { TransactionStatus, TransactionType } from "../common/interface";
import { generateTransactionReference } from "../utils";

@injectable()
export class WalletRepository {
  constructor(
    @inject(delay(() => TransactionRepository))
    private readonly _transactionRepository: TransactionRepository,
  ) {}

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

  async P2PTransfer(
    recipientId: Types.ObjectId,
    recipientName: string,
    senderId: Types.ObjectId,
    senderName: string,
    amount: number,
  ) {
    try {
      await Promise.all([
        this.incrementBalance(recipientId, amount),
        this.decreaseBalance(senderId, amount),
      ]);

      const generatedReference = generateTransactionReference("p2p");

      const recipient_transaction_data = {
        from: `Virtual account funding`,
        recipient_name: recipientName,
        recipient_bank: `Pennywise Wallet`,
        amount_credited: String(amount),
        type: TransactionType.FUNDING,
        status: TransactionStatus.SUCCESSFUL,
        reference: generatedReference,
        description: `Funding from wallet`,
      };

      const sender_transaction_data = {
        from: `Virtual account transfer`,
        recipient_name: senderName,
        recipient_bank: `Pennywise Wallet`,
        amount_debited: String(amount),
        type: TransactionType.DISBURSE,
        status: TransactionStatus.SUCCESSFUL,
        reference: generatedReference,
        description: `Withdrawal from wallet`,
      };

      const [recipient_wallet, sender_wallet] = await Promise.all([
        await this.getWalletInfo(recipientId),
        await this.getWalletInfo(senderId),
      ]);

      await Promise.all([
        this._transactionRepository.createTransaction(
          recipient_transaction_data,
          recipient_wallet._id,
        ),

        this._transactionRepository.createTransaction(
          sender_transaction_data,
          sender_wallet._id,
        ),
      ]);

      return { success: true };
    } catch (err: any) {
      console.error("Error performing p2p transfer", err);
      throw err;
    }
  }
}
