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
}
