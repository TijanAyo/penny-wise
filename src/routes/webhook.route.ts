import express, { Router } from "express";
import { WebHookController } from "../controllers";
import { container } from "tsyringe";

const router: Router = express.Router();
const walletController = container.resolve(WebHookController);

router.post(
  "/flw-webhook",
  walletController.listenToWebhook.bind(walletController),
);

export { router as webHookRoute };
