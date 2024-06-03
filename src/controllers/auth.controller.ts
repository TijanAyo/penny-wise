import { Request, Response } from "express";
import ErrorHandler from "../helpers/error-handler";

const errorHandler: ErrorHandler = new ErrorHandler();

export class AuthController {
  public async lookUp(req: Request, res: Response) {
    try {
      // code goes here
    } catch (err: any) {
      return await errorHandler.handleCustomError(err, res);
    }
  }
  public async register(req: Request, res: Response) {
    try {
      // code goes here
    } catch (err: any) {
      return await errorHandler.handleCustomError(err, res);
    }
  }

  public async login(req: Request, res: Response) {
    try {
      // code goes here
    } catch (err: any) {
      return await errorHandler.handleCustomError(err, res);
    }
  }
}
