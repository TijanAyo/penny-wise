import { injectable } from "tsyringe";
import Transaction from "../models/transaction.model";
import { transactionData } from "../interface";
import { formatDate } from "../utils";
import { badRequestException } from "../helpers";
import { Types } from "mongoose";
import { WalletRepository } from "../repositories";

@injectable()
export class TransactionRepository {
  constructor(private readonly _walletRepository: WalletRepository) {}

  private readonly NOW = new Date();

  public async createTransaction(
    transactionData: transactionData,
    walletId: Types.ObjectId,
  ) {
    try {
      return await Transaction.create({
        from: transactionData.from,
        recipient_name: transactionData.recipient_name,
        recipient_bank: transactionData.recipient_bank,
        date: formatDate(this.NOW),
        amount_credited: transactionData.amount_credited,
        amount_debited: transactionData.amount_debited,
        reference: transactionData.reference,
        type: transactionData.type,
        status: transactionData.status,
        description: transactionData.description,
        wallet: walletId,
      });
    } catch (err: any) {
      console.error("Error creating transaction:", err);
      throw err;
    }
  }

  public async getTransactions(userId: Types.ObjectId) {
    try {
      return await this._walletRepository.getWalletTransactions(userId);
    } catch (err: any) {
      console.error("Error getting transactions:", err);
      throw err;
    }
  }
}
