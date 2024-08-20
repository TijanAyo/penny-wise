import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { ErrorHandler } from "../helpers/error-handler";
import { TransactionService } from "../services";

@injectable()
export class TransactionController {
  constructor(
    private readonly _errorHandler: ErrorHandler,
    private readonly _transactionService: TransactionService,
  ) {}

  public async getTransactions(req: Request, res: Response) {
    try {
      const { _id } = req.user;

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await this._transactionService.viewAllTransaction(
        _id,
        page,
        limit,
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }

  public async getTransactionInfo(req: Request, res: Response) {
    try {
      const { _id } = req.user;
      const { transactionId } = req.params;
      const result = await this._transactionService.viewTransactionDetails(
        _id,
        transactionId,
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }
}
