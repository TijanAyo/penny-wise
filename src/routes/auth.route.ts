import express, { Router } from "express";
import { AuthController } from "../controllers";
import { container } from "tsyringe";

const router: Router = express.Router();
const authController = container.resolve(AuthController);

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));

export { router as authRoute };
