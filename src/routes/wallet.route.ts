import express, { Router } from "express";
import { WalletController } from "../controllers";
import { container } from "tsyringe";

const router: Router = express.Router();
const walletController = container.resolve(WalletController);

router.post(
  "/new/virtual-account",
  walletController.createVirtualAccount.bind(walletController),
);

export { router as walletRoute };
