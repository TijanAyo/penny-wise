import express, { Router } from "express";
import { AuthController } from "../controllers";

const router: Router = express.Router();
const authController: AuthController = new AuthController();

router.post("/lookup", authController.lookUp);
router.post("/register", authController.register);
router.post("/login", authController.login);

export { router as authRoute };
