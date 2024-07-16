import { Types } from "mongoose";
import { injectable } from "tsyringe";

interface transactionData {
  from?: string;
  recipient_name: string;
  recipient_bank: string;
  date: string;
  amount_credited?: string;
  amount_debited?: string;
  type: string;
  status: string;
  description: string;
  wallet: Types.ObjectId;
}

@injectable()
export class TransactionService {
  public async createTransaction(payload: transactionData) {}

  public async viewAllTransaction(userId: string) {
    // Implementation for getting all transactions that belongs to the user
  }

  public async getTransactionDetails(transactionId: string) {
    // Implementation for getting details of a specific transaction
  }
}
