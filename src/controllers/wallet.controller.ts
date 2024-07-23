import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { ErrorHandler } from "../helpers/error-handler";
import { WalletService } from "../services";

@injectable()
export class WalletController {
  constructor(
    private readonly _errorHandler: ErrorHandler,
    private readonly _walletService: WalletService,
  ) {}

  public async getWalletInfo(req: Request, res: Response) {
    try {
      const { _id } = req.user;
      const result = await this._walletService.getVirtualAccountDetails(_id);
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }

  public async makeTransfer(req: Request, res: Response) {
    try {
      const { _id } = req.user;
      const result = await this._walletService.disburse(_id, req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }
}
