import { injectable } from "tsyringe";
import { Types } from "mongoose";
import { UserRepository, WalletRepository } from "../repositories";
import {
  AppResponse,
  badRequestException,
  logger,
  validationException,
} from "../helpers";
import { FLUTTERWAVE_CLIENT } from "../common/flutterwave";
import {
  disbursePayload,
  p2pPayload,
  withdrawPayload,
} from "../common/interface";
import { generateTransactionReference } from "../utils";
import { disburseSchema, p2pSchema, withdrawSchema } from "../validations";
import { ZodError } from "zod";

@injectable()
export class WalletService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
  ) {}

  public async getWalletInfo(userId: Types.ObjectId) {
    try {
      const [user, walletInfo] = await Promise.all([
        await this._userRepository.findByUserId(userId),
        await this._walletRepository.getWalletInfo(userId),
      ]);

      /* const user = await this._userRepository.findByUserId(userId);
      const walletInfo = await this._walletRepository.getWalletInfo(userId); 
      */

      if (!user.isWalletSet) {
        throw new badRequestException(
          "Wallet has not been created for this account",
        );
      }
      if (!walletInfo) {
        throw new badRequestException("Wallet not found");
      }
      return AppResponse(
        walletInfo,
        "Wallet information retrieved successfully",
      );
    } catch (error: any) {
      logger.error(`getWalletInfoError: ${error}`);
      throw error;
    }
  }

  public async disburse(
    userId: Types.ObjectId,
    payload: disbursePayload,
    disburseType?: string,
  ) {
    try {
      const user = await this._userRepository.findByUserId(userId);

      const { accountBank, accountNumber, amount, narration } =
        await disburseSchema.parseAsync(payload);
      const generatedReference = generateTransactionReference(
        disburseType ? disburseType : "disburse",
      );

      const response = await FLUTTERWAVE_CLIENT.post("/transfers", {
        account_bank: accountBank,
        account_number: accountNumber,
        amount: amount,
        currency: "NGN",
        narration: narration,
        reference: generatedReference,
      });

      if (response.data.status !== "success") {
        throw new badRequestException(
          "Transfer could not be processed, kindly try again in a few minute",
        );
      }
      console.log("Transfer response=>", response.data);

      /* Store the transaction reference so it can be used to validate the 
       transaction when the transfer event is received */
      const transactionRef = response.data.data.reference;
      await this._walletRepository.storeTransactionRef(
        transactionRef,
        user.emailAddress,
      );

      return AppResponse(null, response.data.message);
    } catch (error: any) {
      logger.error(`disburseError: ${error}`);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }

  public async p2pTransfer(userId: Types.ObjectId, payload: p2pPayload) {
    try {
      const user = await this._userRepository.findByUserId(userId);

      const { username, amount } = await p2pSchema.parseAsync(payload);

      const recipient = await this._userRepository.findByUsername(username);

      if (!recipient) {
        throw new badRequestException(
          "No user associated with this username, check input and try again",
        );
      }

      if (recipient.username === user.username) {
        throw new badRequestException("You cannot send money to yourself");
      }

      const senderName = `${user.firstName} ${user.lastName}`;

      const transfer = await this._walletRepository.P2PTransfer(
        recipient._id,
        username,
        user._id,
        senderName,
        amount,
      );

      if (!transfer.success) {
        console.log("p2p not successful");
        throw new badRequestException("An unexpected error has occurred");
      }

      return AppResponse(null, `Transfer successful`, true);
    } catch (error: any) {
      logger.error(`p2pError: ${error}`);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }

  public async withdraw(userId: Types.ObjectId, payload: withdrawPayload) {
    try {
      const user = await this._userRepository.findByUserId(userId);

      const { amount, pin, otpCode } = await withdrawSchema.parseAsync(payload);

      // Validate OTP provided by user
      const isOtpValid = await this._userRepository.validateOTP(
        user.emailAddress,
        otpCode,
        "otp_confirmation",
      );

      // Mark OTP has valid
      if (isOtpValid) {
        await this._userRepository.markOTPHasValidated(
          user.emailAddress,
          "otp_confirmation",
        );
      }

      const withdrawalPayload = {
        accountBank: user.settlementBankCode,
        accountNumber: user.settlementAccountNumber,
        amount,
        narration: "Withdrawal",
        pin,
      };

      // Make withdrawals
      const response = await this.disburse(
        user._id,
        withdrawalPayload,
        "withdrawal",
      );

      if (response.success) {
        // TODO: Queue an email notifiying the user about the withdrawal
        return AppResponse(null, `Withdrawal has successfully queued`, true);
      }
    } catch (error: any) {
      logger.error(`WithdrawalError: ${error}`);
      throw error;
    }
  }
}
