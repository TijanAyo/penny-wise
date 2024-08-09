import { injectable } from "tsyringe";
import { Itransaction, transactionData } from "../common/interface";
import { TransactionRepository } from "../repositories";
import mongoose, { Types } from "mongoose";
import { AppResponse, badRequestException } from "../helpers";

@injectable()
export class TransactionService {
  constructor(private readonly _transactionRepository: TransactionRepository) {}

  public async createTransaction(
    payload: transactionData,
    walletId: Types.ObjectId,
  ) {
    try {
      const newTransaction =
        await this._transactionRepository.createTransaction(payload, walletId);
      if (!newTransaction)
        throw new badRequestException(
          "An error occurred while updating transaction",
        );
      return newTransaction;
    } catch (error: any) {
      console.error("createTransactionErr", error);
      throw error;
    }
  }

  public async viewAllTransaction(userId: Types.ObjectId) {
    try {
      const transactions =
        await this._transactionRepository.getTransactions(userId);
      if (!transactions) {
        throw new badRequestException(
          "An error occurred while fetching transactions",
        );
      }

      const data = transactions.map((transaction: Itransaction) => ({
        id: transaction._id,
        amount:
          transaction.amount_credited !== undefined
            ? `+${transaction.amount_credited}`
            : ` -${transaction.amount_debited}`,
        time: transaction.date,
        status: transaction.status,
        type: transaction.type,
      }));

      return AppResponse(data, "Transactions fetched successfully", true);
    } catch (error: any) {
      console.error("viewAllTransactionErr", error);
      throw error;
    }
  }

  public async viewTransactionDetails(transactionId: string) {
    try {
      const transaction = await this._transactionRepository.getTransactionInfo(
        new mongoose.Types.ObjectId(transactionId),
      );
      if (!transaction) {
        console.log("TransactionId could not be found");
        throw new badRequestException(
          "An error occurred while fetching transaction infomation",
        );
      }
      return AppResponse(
        transaction,
        "Transaction details fetched successfully",
        true,
      );
    } catch (error: any) {
      console.error("getTransactionDetailsErr", error);
      throw error;
    }
  }
}
