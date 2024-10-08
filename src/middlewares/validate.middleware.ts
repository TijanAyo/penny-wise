import { Request, Response, NextFunction } from "express";
import { compareHash } from "../utils";
import Wallet from "../models/wallet.model";

/**
 * @desc "Validate request to make sure it's compliant"
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const ValidateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    const { amount, pin } = req.body;

    if (!user.isEmailVerified) {
      return res.status(400).json({
        data: null,
        message:
          "Email address not verified, kindly verify email address before performing this action",
        success: false,
      });
    }

    if (!user.isPinSet) {
      return res.status(400).json({
        data: null,
        message:
          "Transaction pin not set, kindly set a transaction pin before performing this action",
        success: false,
      });
    }

    if (!user.isSettlementAccountSet) {
      return res.status(400).json({
        data: null,
        message:
          "Settlement account not set, kindly provide an account before performing this action",
        success: false,
      });
    }

    const walletInfo = await Wallet.findOne({ user: user._id });

    if (walletInfo.balance < amount) {
      return res.status(400).json({
        data: null,
        message: "Insufficient balance to complete transaction",
        success: false,
      });
    }

    const doesPinMatch = await compareHash(pin, user.pin);
    if (!doesPinMatch) {
      return res.status(400).json({
        data: null,
        message: "Invalid transaction pin, kindly check input and try again",
        success: false,
      });
    }

    next();
  } catch (error: any) {
    console.error("Error in validateTransaction middleware:", error);
    return res.status(500).json({
      data: null,
      message: "Internal server error",
      success: false,
    });
  }
};

export const validateQueryParams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validParams = ["page", "limit"];
  const queryKeys = Object.keys(req.query);

  const hasInvalidParams = queryKeys.some((key) => !validParams.includes(key));

  if (hasInvalidParams) {
    return res.status(400).json({
      data: null,
      message: 'Invalid query parameters. Only "page" and "limit" are allowed.',
      success: false,
    });
  }

  next();
};
