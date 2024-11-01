import express, { Router } from "express";
import { WalletController } from "../controllers";
import {
  AuthMiddleWare,
  ValidateMiddleware,
  validatePayment,
} from "../middlewares";
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
  ValidateMiddleware,
  validatePayment,
  walletController.makeTransfer.bind(walletController),
);

router.post(
  "/p2p",
  AuthMiddleWare,
  ValidateMiddleware,
  validatePayment,
  walletController.P2P.bind(walletController),
);

router.post(
  "/withdraw",
  AuthMiddleWare,
  ValidateMiddleware,
  validatePayment,
  walletController.withdraw.bind(walletController),
);

export { router as walletRoute };
