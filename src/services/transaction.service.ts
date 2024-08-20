import { injectable } from "tsyringe";
import { Itransaction, transactionData } from "../common/interface";
import { TransactionRepository, WalletRepository } from "../repositories";
import mongoose, { Types } from "mongoose";
import {
  AppResponse,
  badRequestException,
  unauthorizedException,
} from "../helpers";

@injectable()
export class TransactionService {
  constructor(
    private readonly _transactionRepository: TransactionRepository,
    private readonly _walletRepository: WalletRepository,
  ) {}

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

  public async viewTransactionDetails(
    userId: Types.ObjectId,
    transactionId: string,
  ) {
    try {
      const wallet = await this._walletRepository.getWalletInfo(userId);
      const transaction = await this._transactionRepository.getTransactionInfo(
        new mongoose.Types.ObjectId(transactionId),
      );

      console.log("WALLET:", wallet._id);
      console.log("TransactionWalletId:", transaction.wallet._id);

      if (!transaction) {
        console.log("TransactionId could not be found");
        throw new badRequestException(
          "Invalid transaction ID, kinldy check input and try again",
        );
      }

      if (transaction.wallet.toString() !== wallet._id.toString()) {
        throw new unauthorizedException(
          "You are not authorized to view this transaction",
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
