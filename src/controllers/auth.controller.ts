import { Request, Response } from "express";
import { injectable } from "tsyringe";
import {ErrorHandler} from "../helpers/error-handler";

@injectable()
export class AuthController {
  constructor(private readonly errorHandler: ErrorHandler) {}

  public async lookUp(req: Request, res: Response) {
    try {
      // code goes here
    } catch (err: any) {
      return await this.errorHandler.handleCustomError(err, res);
    }
  }
  public async register(req: Request, res: Response) {
    try {
      // code goes here
    } catch (err: any) {
      return await this.errorHandler.handleCustomError(err, res);
    }
  }

  public async login(req: Request, res: Response) {
    try {
      // code goes here
    } catch (err: any) {
      return await this.errorHandler.handleCustomError(err, res);
    }
  }
}
