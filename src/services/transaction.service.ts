import { injectable } from "tsyringe";
import { transactionData } from "../interface";
import { TransactionRepository } from "../repositories";
import { Types } from "mongoose";
import { badRequestException } from "../helpers";

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

  public async viewAllTransaction(userId: string) {
    // Implementation for getting all transactions that belongs to the user
  }

  public async getTransactionDetails(transactionId: string) {
    // Implementation for getting details of a specific transaction
  }
}
