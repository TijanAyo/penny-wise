import express, { Router } from "express";
import { AuthMiddleWare } from "../middlewares";
import { AccountController } from "../controllers";
import { container } from "tsyringe";

const router: Router = express.Router();
const accountController = container.resolve(AccountController);

router.post(
  "/new/virtual-account",
  AuthMiddleWare,
  accountController.createVirtualAccount.bind(accountController),
);

export { router as accountRoute };
