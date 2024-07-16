import { injectable } from "tsyringe";
import { Types } from "mongoose";
import Wallet from "../models/wallet.model";
import { badRequestException } from "../helpers";

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

  async getWalletTransactions(userId: Types.ObjectId) {
    try {
      return await Wallet.findOne({ user: userId }).populate("transactions");
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

  async updateFieldInDB(id: Types.ObjectId, updateData: Record<string, any>) {
    try {
      const update = await Wallet.findOneAndUpdate(
        { user: id },
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
}
