import express, { Router } from "express";
import { WalletController } from "../controllers";
import { AuthMiddleWare } from "../middlewares";
import { container } from "tsyringe";

const router: Router = express.Router();
const walletController = container.resolve(WalletController);

router.post(
  "/new/virtual-account",
  AuthMiddleWare,
  walletController.createVirtualAccount.bind(walletController),
);

router.get(
  "/info",
  AuthMiddleWare,
  walletController.getWalletInfo.bind(walletController),
);

export { router as walletRoute };
