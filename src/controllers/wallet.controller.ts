import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { ErrorHandler } from "../helpers/error-handler";
import { WalletService } from "../services";
import mongoose, { Types } from "mongoose";

@injectable()
export class WalletController {
  constructor(
    private readonly _errorHandler: ErrorHandler,
    private readonly _walletService: WalletService,
  ) {}

  public async createVirtualAccount(req: Request, res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId("66904d23a9549389ebe5a1dd");
      const result = await this._walletService.createVirtualAccountNumber(
        userId,
        req.body,
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }
}
