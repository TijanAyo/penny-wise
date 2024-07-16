import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { ErrorHandler } from "../helpers/error-handler";
import { AccountService } from "../services";

@injectable()
export class AccountController {
  constructor(
    private readonly _errorHandler: ErrorHandler,
    private readonly _accountService: AccountService,
  ) {}

  public async createVirtualAccount(req: Request, res: Response) {
    try {
      const { _id } = req.user;
      const result = await this._accountService.createVirtualAccountNumber(
        _id,
        req.body,
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }
}
