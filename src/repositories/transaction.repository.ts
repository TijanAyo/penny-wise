import { injectable, inject, delay } from "tsyringe";
import Transaction from "../models/transaction.model";
import { transactionData } from "../common/interface";
import { formatDate } from "../utils";
import { Types } from "mongoose";
import { WalletRepository } from "../repositories";
import * as _ from "lodash";
import { badRequestException } from "../helpers";

@injectable()
export class TransactionRepository {
  constructor(
    @inject(delay(() => WalletRepository))
    private readonly _walletRepository: WalletRepository,
  ) {}

  private readonly NOW = new Date();

  async createTransaction(
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

  async getTransactionHistory(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ) {
    try {
      const walletId = await this._walletRepository.getWalletInfo(userId);

      const skip = (page - 1) * limit;
      const transactions = await Transaction.find({ wallet: walletId })
        .skip(skip)
        .limit(limit)
        .lean()
        .sort({ createdAt: -1 })
        .select({
          amount: 1,
          date: 1,
          status: 1,
          type: 1,
          amount_credited: 1,
          amount_debited: 1,
        });

      if (!transactions.length) {
        throw new badRequestException("No transactions found");
      }

      const total = await Transaction.countDocuments({ wallet: walletId });

      return { transactions, total };
    } catch (err: any) {
      console.error("Error getting transactions:", err);
      throw err;
    }
  }

  async getTransactionInfo(transactionId: Types.ObjectId) {
    try {
      const transactionInfo = await Transaction.findById({ _id: transactionId })

        .select({
          wallet: 1,
          from: 1,
          recipient_name: 1,
          recipient_bank: 1,
          date: 1,
          amount_credited: 1,
          reference: 1,
          type: 1,
          status: 1,
          description: 1,
          createdAt: 1,
        });

      return transactionInfo;
    } catch (err: any) {
      console.error("Error getting transaction info:", err);
      throw err;
    }
  }

  async generateWalletTrx(
    userId: Types.ObjectId,
    newTransaction: transactionData,
  ) {
    try {
      const { _id } = await this._walletRepository.getWalletInfo(userId);
      const transaction = await this.createTransaction(newTransaction, _id);
      return transaction;
    } catch (err: any) {
      console.error("Error creating wallet transaction info:", err);
      throw err;
    }
  }
}
