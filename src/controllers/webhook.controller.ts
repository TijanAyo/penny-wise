import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { ErrorHandler } from "../helpers/error-handler";
import { WebHookService } from "../services";

@injectable()
export class WebHookController {
  constructor(
    private readonly _errorHandler: ErrorHandler,
    private readonly _webhookService: WebHookService,
  ) {}

  public async listenToWebhook(req: Request, res: Response) {
    try {
      const result = await this._webhookService.handleFlwWebhookEvents(
        req,
        res,
      );
      return res.json(result);
    } catch (error: any) {
      return await this._errorHandler.handleCustomError(error, res);
    }
  }
}
