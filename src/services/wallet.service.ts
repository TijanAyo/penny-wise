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

      /*
        Map the reference to the user id 
        on redis

        where there reference is the key and the value if the user identifier e.g email

        during verification return back the reference gotten into transferEvent

        making use of the reference get the value and find for the user on the database

        and get the field information you want to get


      */

      return AppResponse(null, response.data.message, true);

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
