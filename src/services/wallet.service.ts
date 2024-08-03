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
import { disbursePayload, p2pPayload } from "../interface";
import { generateTransactionReference } from "../utils";
import { disburseSchema, p2pSchema } from "../validations";
import { ZodError } from "zod";

@injectable()
export class WalletService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
  ) {}

  public async getWalletInfo(userId: Types.ObjectId) {
    try {
      const walletInfo = await this._walletRepository.getWalletInfo(userId);
      if (!walletInfo) {
        throw new badRequestException("Wallet information not found");
      }
      return AppResponse(
        walletInfo,
        "Wallet information retrieved successfully",
        true,
      );
    } catch (error: any) {
      logger.error(`getWalletInfoError: ${error}`);
      throw error;
    }
  }

  public async disburse(userId: Types.ObjectId, payload: disbursePayload) {
    try {
      const user = await this._userRepository.findByUserId(userId);

      const { accountBank, accountNumber, amount, narration } =
        await disburseSchema.parseAsync(payload);
      const generatedReference = generateTransactionReference("disburse");

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

      const transactionRef = response.data.data.reference;
      await this._walletRepository.storeTransactionRef(
        transactionRef,
        user.emailAddress,
      );

      return AppResponse(null, response.data.message, true);
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

  public async withdraw() {}
}
