import { injectable } from "tsyringe";
import {
  changePasswordPayload,
  createOtpPayload,
  createVirtualAccountNumberPayload,
  NextOfKin,
  setSettlementAccountPayload,
  setTransactionPinPayload,
  setUsernamePayload,
  updateProfileInfoPayload,
  VirtualAccountResponse,
} from "../common/interface";
import { environment } from "../config";
import {
  compareHash,
  formatDate,
  generateRandomOTP,
  getBankCode,
  hashPayload,
} from "../utils";
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
  changePasswordSchema,
  createOtpSchema,
  createVirtualAccountNumberSchema,
  setSettlementAccountSchema,
  setTransactionPinSchema,
  setUsernameSchema,
  updateProfileInfoSchema,
} from "../validations";
import { UserRepository, WalletRepository } from "../repositories";
import { EmailQueue } from "../common/queues";

@injectable()
export class AccountService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
    private readonly _emailQueueService: EmailQueue,
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

      const { username } = await setUsernameSchema.parseAsync(payload);

      const usernameExist = await this._userRepository.findByUsername(username);

      if (usernameExist) {
        if (usernameExist.username === user.username) {
          throw new badRequestException(
            "You are already making use of this username",
          );
        }

        throw new badRequestException(
          "Username is already associated with another user",
        );
      }

      await this._userRepository.updateFieldInDB(user.emailAddress, {
        username,
        usernameUpdatedAt: formatDate(this.NOW),
      });

      return AppResponse(null, "Username has been successfully", true);
    } catch (error: any) {
      console.log("createUsernameError=>", error);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }

  public async setSettlementAccount(
    userId: Types.ObjectId,
    payload: setSettlementAccountPayload,
  ) {
    try {
      const user = await this._userRepository.findByUserId(userId);

      const { account_number, bank_name, pin } =
        await setSettlementAccountSchema.parseAsync(payload);

      const doesPinMatch = await compareHash(pin, user.pin);
      if (!doesPinMatch) {
        throw new badRequestException(
          "Invalid transaction pin, kindly check input and try again",
        );
      }

      const bank_code = getBankCode(bank_name);
      console.log("bank code ===>", bank_code);
      await this._userRepository.updateFieldInDB(user.emailAddress, {
        settlementAccountNumber: account_number,
        settlementBankName: bank_name,
        settlementBankCode: bank_code,
        isSettlementAccountSet: true,
      });

      return AppResponse(
        null,
        "Settlement account has been set successfully",
        true,
      );
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
        console.log("addNextOfKinError: User not found");
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

  public async createOTP(payload: createOtpPayload) {
    let otpCode: Promise<string> | string;
    let codeLen: number;
    try {
      const user = await this._userRepository.findByEmail(payload.email);
      if (!user) {
        console.log(
          "createOTPError: User associated with this email not found",
        );
        throw new badRequestException("User not found");
      }

      const { reason } = await createOtpSchema.parseAsync(payload);
      codeLen = reason === "WITHDRAWAL" ? 7 : reason === "PIN_CHANGE" ? 5 : 6;

      otpCode = generateRandomOTP(codeLen);
      await this._userRepository.storeOTP(
        user.emailAddress,
        otpCode,
        "otp_confirmation",
      );
      await this._emailQueueService.sendEmailQueue({
        type: "createOTP",
        payload: {
          email: user.emailAddress,
          otp: otpCode,
        },
      });

      return AppResponse(null, "success", true);
    } catch (error: any) {
      console.log("createOTPError=>", error);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }

  public async changePassword(
    userId: Types.ObjectId,
    payload: changePasswordPayload,
  ) {
    try {
      const user = await this._userRepository.findByUserId(userId);
      if (!user) {
        console.log("changePasswordError: User not found");
        throw new badRequestException("User not found");
      }

      const { oldPassword, newPassword, confirmPassword, otp } =
        await changePasswordSchema.parseAsync(payload);

      // Validate OTP provided by user
      const isOtpValid = await this._userRepository.validateOTP(
        user.emailAddress,
        otp,
        "otp_confirmation",
      );

      const oldPasswordMatch = await compareHash(oldPassword, user.password);
      if (!oldPasswordMatch) {
        throw new badRequestException(
          "Incorrect Old Password, kindly check the input and try again",
        );
      }

      if (newPassword !== confirmPassword) {
        throw new badRequestException(
          "Password does not match, kindly check input and try again",
        );
      }

      if (isOtpValid) {
        await this._userRepository.markOTPHasValidated(
          user.emailAddress,
          "otp_confirmation",
        );
      }

      const hashNewPassword = await hashPayload(confirmPassword);

      await Promise.all([
        this._userRepository.updateFieldInDB(user.emailAddress, {
          password: hashNewPassword,
          passwordChangedAt: formatDate(this.NOW),
        }),

        this._emailQueueService.sendEmailQueue({
          type: "credentialChangeNotification",
          payload: {
            email: user.emailAddress,
            reason: "Password",
          },
        }),
      ]);

      return AppResponse(null, "Password changed successfully", true);
    } catch (error: any) {
      console.log("changePasswordError=>", error);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }

  public async updateProfileInfo(
    userId: Types.ObjectId,
    payload: updateProfileInfoPayload,
  ) {
    try {
      const user = await this._userRepository.findByUserId(userId);
      if (!user) {
        console.log("changePasswordError: User not found");
        throw new badRequestException("User not found");
      }

      const validatedPayload =
        await updateProfileInfoSchema.parseAsync(payload);

      // Check if the username exists and belongs to another user
      if (validatedPayload.username !== undefined) {
        const usernameExist = await this._userRepository.findByUsername(
          validatedPayload.username,
        );

        if (usernameExist && !usernameExist._id.equals(userId)) {
          throw new badRequestException(
            "Username is already associated with another user",
          );
        }
      }

      const updatedAddress = {
        ...user.address,
        ...validatedPayload.address,
      };

      const updatedNextOfKin = {
        ...user.nextOfKin,
        ...validatedPayload.nextOfKin,
      };

      const updateData = {
        username: validatedPayload.username ?? user.username,
        gender: validatedPayload.gender ?? user.gender,
        address: updatedAddress,
        nextOfKin: updatedNextOfKin,
      };

      await this._userRepository.updateFieldInDB(user.emailAddress, updateData);

      return AppResponse(null, "Updated successfully", true);
    } catch (error: any) {
      console.log("updateProfileError=>", error);
      if (error instanceof ZodError) {
        throw new validationException(error.errors[0].message);
      }
      throw error;
    }
  }
}
