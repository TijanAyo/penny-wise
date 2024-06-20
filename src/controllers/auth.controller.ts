import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { ErrorHandler } from "../helpers/error-handler";
import { AuthService } from "../services";

@injectable()
export class AuthController {
  constructor(
    private readonly errorHandler: ErrorHandler,
    private readonly authService: AuthService,
  ) {}

  public async register(req: Request, res: Response) {
    try {
      const result = await this.authService.register(req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      return await this.errorHandler.handleCustomError(err, res);
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const result = await this.authService.login(req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return await this.errorHandler.handleCustomError(err, res);
    }
  }
}
