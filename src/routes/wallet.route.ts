import express, { Router } from "express";
import { WalletController } from "../controllers";
import { AuthMiddleWare, ValidateTransactionMiddleware } from "../middlewares";
import { container } from "tsyringe";

const router: Router = express.Router();
const walletController = container.resolve(WalletController);

router.get(
  "/info",
  AuthMiddleWare,
  walletController.getWalletInfo.bind(walletController),
);

router.post(
  "/transfer",
  AuthMiddleWare,
  ValidateTransactionMiddleware,
  walletController.makeTransfer.bind(walletController),
);

export { router as walletRoute };
