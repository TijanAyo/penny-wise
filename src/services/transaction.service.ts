import { injectable } from "tsyringe";

@injectable()
export class TransactionService {
  public async viewAllTransaction(userId: string) {
    // Implementation for getting all transactions that belongs to the user
  }

  public async getTransactionDetails(transactionId: string) {
    // Implementation for getting details of a specific transaction
  }

  public async createTransaction(transactionData: any) {
    // Implementation for creating a new transaction record
  }
}
