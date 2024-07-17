import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { ErrorHandler } from "../helpers/error-handler";
import { AuthService } from "../services";

@injectable()
export class AuthController {
  constructor(
    private readonly _errorHandler: ErrorHandler,
    private readonly _authService: AuthService,
  ) {}

  public async register(req: Request, res: Response) {
    try {
      const result = await this._authService.register(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const result = await this._authService.login(req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }

  public async forgotPassword(req: Request, res: Response) {
    try {
      const result = await this._authService.forgotPassword(req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }

  public async resetPassword(req: Request, res: Response) {
    try {
      const result = await this._authService.resetPassword(req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }

  public async verifyEmailAddress(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const result = await this._authService.verifyEmailAddress(token);
      return res.status(200).json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }
}
