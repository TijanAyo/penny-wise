import { injectable } from "tsyringe";
import { transactionData } from "../interface";
import { TransactionRepository } from "../repositories";
import { Types } from "mongoose";
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
      return AppResponse(
        transactions,
        "Transactions fetched successfully",
        true,
      );
    } catch (error: any) {
      console.error("viewAllTransactionErr", error);
      throw error;
    }
  }

  public async getTransactionDetails(transactionId: string) {
    // Implementation for getting details of a specific transaction
  }
}
