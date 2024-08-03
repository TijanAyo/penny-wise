import express, { Router } from "express";
import { WalletController } from "../controllers";
import { AuthMiddleWare, ValidateMiddleware } from "../middlewares";
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
  walletController.makeTransfer.bind(walletController),
);

router.post(
  "/p2p",
  AuthMiddleWare,
  ValidateMiddleware,
  walletController.P2P.bind(walletController),
);

export { router as walletRoute };
