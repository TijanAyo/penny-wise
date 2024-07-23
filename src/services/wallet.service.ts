import { injectable } from "tsyringe";
import { Types } from "mongoose";
import { UserRepository, WalletRepository } from "../repositories";
import {
  AppResponse,
  badRequestException,
  validationException,
} from "../helpers";
import { FLUTTERWAVE_CLIENT } from "../common/flutterwave";
import { disbursePayload } from "../interface";
import { generateTransactionReference } from "../utils";
import { disburseSchema } from "../validations";
import { ZodError } from "zod";

@injectable()
export class WalletService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
  ) {}

  public async getVirtualAccountDetails(userId: Types.ObjectId) {
    try {
      const user = await this._userRepository.findByUserId(userId);
      if (!user) {
        console.log("getVirtualAccountDetailsError: User not found");
        throw new badRequestException("User not found");
      }

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
      throw error;
    }
  }

  public async disburse(userId: Types.ObjectId, payload: disbursePayload) {
    try {
      const user = await this._userRepository.findByUserId(userId);
      if (!user) {
        console.log("disburseError: User not found");
        throw new badRequestException("User not found");
      }

      const { accountBank, accountNumber, amount, narration } =
        await disburseSchema.parseAsync(payload);

      const response = await FLUTTERWAVE_CLIENT.post("/transfers", {
        account_bank: accountBank,
        account_number: accountNumber,
        amount: amount,
        currency: "NGN",
        narration: narration,
        reference: generateTransactionReference(),
      });

      console.log("disburse==>>>", response);

      return "transaction has been done";

      /*    
        - After a successful debit (To be done in webhook service)

        4. debit the amount from wallet balance
        5. Update the transacation record with
        6. Send an email notifying the user about the debit 

      */
    } catch (error: any) {
      console.log("DisburseError=>", error);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }

  public async p2pTransfer() {}

  public async withdraw() {}
}
