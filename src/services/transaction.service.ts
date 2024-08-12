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

  public async viewAllTransaction(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ) {
    try {
      const { transactions, total } =
        await this._transactionRepository.getTransactionHistory(
          userId,
          page,
          limit,
        );

      const totalPages = Math.ceil(total / limit);
      const nextPage = page < totalPages ? page + 1 : null;

      const previousPage = page > 1 ? page - 1 : null;

      const data = {
        transactions,
        meta: {
          currentPage: page,
          totalPages: totalPages,
          nextPage: nextPage,
          previousPage: previousPage,
        },
      };

      return AppResponse(data, "Transactions fetched successfully");
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
          "An error occurred while fetching transaction information",
        );
      }
      return AppResponse(
        transaction,
        "Transaction information fetched successfully",
      );
    } catch (error: any) {
      console.error("getTransactionDetailsErr", error);
      throw error;
    }
  }
}
