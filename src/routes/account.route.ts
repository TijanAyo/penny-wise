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

router.post(
  "/set-transaction-pin",
  AuthMiddleWare,
  accountController.setTransactionPin.bind(accountController),
);

router.post(
  "/set-username",
  AuthMiddleWare,
  accountController.setUsername.bind(accountController),
);

router.post(
  "/set-next-of-kin",
  AuthMiddleWare,
  accountController.setNextOfKin.bind(accountController),
);

router.patch(
  "/update-profile-info",
  AuthMiddleWare,
  accountController.updateProfile.bind(accountController),
);

router.patch(
  "/security/change-password",
  AuthMiddleWare,
  accountController.changePassword.bind(accountController),
);

router.post(
  "/security/create-otp",
  AuthMiddleWare,
  accountController.createOTP.bind(accountController),
);

export { router as accountRoute };
