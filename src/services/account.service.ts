import { injectable } from "tsyringe";
import {
  createVirtualAccountNumberPayload,
  NextOfKin,
  setTransactionPinPayload,
  setUsernamePayload,
  VirtualAccountResponse,
} from "../interface";
import { environment } from "../config";
import { formatDate, hashPayload } from "../utils";
import { ZodError } from "zod";
import {
  AppResponse,
  badRequestException,
  validationException,
} from "../helpers";
import axios from "axios";
import { Types } from "mongoose";
import {
  addNextOfKinSchema,
  createVirtualAccountNumberSchema,
  setTransactionPinSchema,
  setUsernameSchema,
} from "../validations";
import { UserRepository, WalletRepository } from "../repositories";

@injectable()
export class AccountService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
  ) {}

  private readonly FLUTTERWAVE_BASE_URL = `https://api.flutterwave.com/v3`;
  private readonly FLUTTERWAVE_HEADER_CONFIG = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${environment.FLUTTERWAVE_SECRET_KEY}`,
  };
  private readonly NOW = new Date();

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

  public async createUsername(
    userId: Types.ObjectId,
    payload: setUsernamePayload,
  ) {
    try {
      const user = await this._userRepository.findByUserId(userId);
      if (!user) {
        console.log("createTransactionPinError: User not found");
        throw new badRequestException("User not found");
      }

      const { username } = await setUsernameSchema.parseAsync(payload);

      const usernameExist = await this._userRepository.findByUsername(username);
      if (usernameExist) {
        throw new badRequestException(
          "Username is already associated with another user",
        );
      }

      await this._userRepository.updateFieldInDB(user.emailAddress, {
        username,
        usernameUpdatedAt: formatDate(this.NOW),
      });

      return AppResponse(null, "Username set successfully", true);
    } catch (error: any) {
      console.log("createUsernameError=>", error);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }

  public async createTransactionPin(
    userId: Types.ObjectId,
    payload: setTransactionPinPayload,
  ) {
    try {
      const user = await this._userRepository.findByUserId(userId);
      if (!user) {
        console.log("createTransactionPinError: User not found");
        throw new badRequestException("User not found");
      }
      const { pin, confirm_pin } =
        await setTransactionPinSchema.parseAsync(payload);

      if (pin !== confirm_pin) {
        console.log("Transaction pin does not match");
        throw new badRequestException("Pin does not match");
      }

      const hashedPin = await hashPayload(confirm_pin);

      await this._userRepository.updateFieldInDB(user.emailAddress, {
        pin: hashedPin,
        isPinSet: true,
        pinSetAt: formatDate(this.NOW),
      });

      return AppResponse(null, "Transaction has been set successfully", true);
    } catch (error: any) {
      console.log("createTransactionPinError=>", error);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }

  public async addNextOfKin(userId: Types.ObjectId, payload: NextOfKin) {
    try {
      const user = await this._userRepository.findByUserId(userId);
      if (!user) {
        console.log("createTransactionPinError: User not found");
        throw new badRequestException("User not found");
      }

      const {
        firstName,
        lastName,
        emailAddress,
        relationship,
        gender,
        phoneNumber,
        accountNumber,
        accountName,
        bankName,
        city,
        country,
        state,
      } = await addNextOfKinSchema.parseAsync(payload);

      await this._userRepository.updateFieldInDB(user.emailAddress, {
        nextOfKin: {
          firstName,
          lastName,
          emailAddress,
          relationship,
          gender,
          phoneNumber,
          accountNumber,
          accountName,
          bankName,
          city,
          country,
          state,
        },
      });

      return AppResponse(null, "Next of kin added successfully", true);
    } catch (error: any) {
      console.log("addNextOfKinError=>", error);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }

  public async changePassword() {}

  public async updateProfile() {}
}
