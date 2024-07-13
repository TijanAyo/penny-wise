import { injectable } from "tsyringe";
import {
  createVirtualAccountNumberPayload,
  VirtualAccountResponse,
} from "../interface";
import { createVirtualAccountNumberSchema } from "../validations";
import { Types } from "mongoose";
import { UserRepository, WalletRepository } from "../repositories";
import {
  AppResponse,
  badRequestException,
  validationException,
} from "../helpers";
import axios from "axios";
import { environment } from "../config";
import { hashPayload } from "../utils";
import { ZodError } from "zod";

@injectable()
export class WalletService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
  ) {}

  private readonly FLUTTERWAVE_BASE_URL = `https://api.flutterwave.com/v3`;
  private readonly FLUTTERWAVE_HEADER_CONFIG = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${environment.FLUTTERWAVE_SECRET_KEY}`,
  };

  private async sendRequestToFlutterwave(
    data: any,
  ): Promise<VirtualAccountResponse> {
    try {
      const response = await axios.post(
        `${this.FLUTTERWAVE_BASE_URL}/virtual-account-numbers`,
        data,
        {
          headers: this.FLUTTERWAVE_HEADER_CONFIG,
        },
      );

      if (!response || response.status !== 200) {
        throw new badRequestException(
          "An error occurred while generating virtual account...Kindly try again later",
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Error sending request to Flutterwave:", error);
      throw error;
    }
  }

  public async createVirtualAccountNumber(
    userId: Types.ObjectId,
    payload: createVirtualAccountNumberPayload,
  ) {
    try {
      const { bvn } =
        await createVirtualAccountNumberSchema.parseAsync(payload);

      const user = await this._userRepository.findByUserId(userId);
      if (!user) {
        console.log("createVirtualAccountError: User not found");
        throw new badRequestException("User not found");
      }

      const { emailAddress, phoneNumber, firstName, lastName } = user;
      const data = JSON.stringify({
        email: emailAddress,
        is_permanent: true,
        bvn,
        phonenumber: phoneNumber,
        firstname: firstName,
        lastname: lastName,
        narration: `${firstName} ${lastName}`,
      });

      const flw_response = await this.sendRequestToFlutterwave(data);
      const hashedBVN = await hashPayload(bvn);

      const result = {
        bank_name: flw_response.data.bank_name,
        account_number: flw_response.data.account_number,
        balance: 0,
      };

      await Promise.all([
        this._walletRepository.createWallet(userId, {
          account_number: result.account_number,
          account_bank: result.bank_name,
          balance: 0,
        }),

        this._userRepository.updateFieldInDB(emailAddress, {
          BVN: hashedBVN,
        }),
      ]);

      return AppResponse(result, "Virtual account created", true);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new validationException(error.message);
      }
      throw error;
    }
  }

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

  public async disburse() {
    // Check if the user balance is able to make such transaction
    // the receiver bank and account number
  }

  public async p2pTransfer() {}

  public async withdraw() {}
}
