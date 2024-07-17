import express, { Router } from "express";
import { AuthMiddleWare } from "../middlewares";
import { TransactionController } from "../controllers";
import { container } from "tsyringe";

const router: Router = express.Router();
const transactionController = container.resolve(TransactionController);

router.get(
  "/all-transactions",
  AuthMiddleWare,
  transactionController.getTransactions.bind(transactionController),
);

router.get(
  "/view/:transactionId",
  AuthMiddleWare,
  transactionController.getTransactionInfo.bind(transactionController),
);

export { router as transactionRoute };
