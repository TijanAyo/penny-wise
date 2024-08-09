import { injectable } from "tsyringe";
import {
  AppResponse,
  badRequestException,
  URL,
  validationException,
} from "../helpers";
import { UserRepository } from "../repositories";
import {
  forgotPasswordPayload,
  loginPayload,
  registerPayload,
  resetPasswordPayload,
} from "../common/interface";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validations";
import { ZodError } from "zod";
import {
  compareHash,
  formatDate,
  generateAccessToken,
  generateRandomOTP,
  generateVerificationURL,
  hashPayload,
} from "../utils";
import { EmailQueue } from "../common/queues";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { environment } from "../config";

@injectable()
export class AuthService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _emailQueueService: EmailQueue,
  ) {}

  private readonly JWT_SECRET_KEY = environment.JWT_SECRET;
  private readonly NOW = new Date();

  public async register(payload: registerPayload) {
    try {
      const { email, firstName, lastName, phoneNumber, password } =
        await registerSchema.parseAsync(payload);
      const user = await this._userRepository.findByEmail(email);
      if (user) {
        throw new badRequestException(
          "Email already associated with another user. Kindly specify a different email",
        );
      }

      // Hash the password
      const hashPassword = await hashPayload(password);

      // Create user
      await this._userRepository.createUser(
        email,
        firstName,
        lastName,
        phoneNumber,
        hashPassword,
      );

      const verificationString = await generateVerificationURL(email);
      const verificationURL = `${URL}/api/auth/verify-email/${verificationString}`;
      await this._emailQueueService.sendEmailQueue({
        type: "emailVerification",
        payload: {
          email,
          verificationURL,
        },
      });

      return AppResponse(null, "Account registration successful", true);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new validationException(error.message);
      }
      throw error;
    }
  }

  public async login(payload: loginPayload) {
    try {
      const { email, username, password } =
        await loginSchema.parseAsync(payload);

      let user;

      if (email) {
        user = await this._userRepository.findByEmail(email);
      } else if (username) {
        user = await this._userRepository.findByUsername(username);
      }

      if (!user) {
        throw new badRequestException("Invalid credentials, kindly try again");
      }

      const isPasswordValid = await compareHash(password, user.password);
      if (!isPasswordValid) {
        throw new badRequestException("Invalid credentials, kindly try again");
      }

      const token = await generateAccessToken(user._id);

      return AppResponse(
        { accessToken: token },
        "Authorization successful",
        true,
      );
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new validationException(error.message);
      }
      throw error;
    }
  }

  public async forgotPassword(payload: forgotPasswordPayload) {
    try {
      let user;

      const { email } = await forgotPasswordSchema.parseAsync(payload);

      if (email) {
        user = await this._userRepository.findByEmail(email);
      }

      if (!user) {
        throw new badRequestException(
          "Invalid credentials, email not associated with any user",
        );
      }

      const OTP = await generateRandomOTP();

      await this._userRepository.storeOTP(
        user.emailAddress,
        OTP,
        "otp_validation",
      );

      await this._emailQueueService.sendEmailQueue({
        type: "forgotPassword",
        payload: {
          email: user.emailAddress,
          firstName: user.firstName,
          otp: OTP,
        },
      });

      return AppResponse(
        null,
        "If an account exists for the email, you will receive a password reset link",
        true,
      );
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new validationException(error.message);
      }
      throw error;
    }
  }

  public async resetPassword(payload: resetPasswordPayload) {
    try {
      let user;

      const { email, otpCode, newPassword, confirmPassword } =
        await resetPasswordSchema.parseAsync(payload);

      if (email) {
        user = await this._userRepository.findByEmail(email);
      }

      if (!user) {
        throw new badRequestException(
          "Invalid credentials, email not associated with any user",
        );
      }

      // Validate the OTP
      await this._userRepository.validateOTP(email, otpCode, "otp_validation");

      if (newPassword !== confirmPassword) {
        throw new badRequestException("Invalid input, password does not match");
      }

      await this._userRepository.markOTPHasValidated(email, "otp_validation");

      // Hash the password
      const hashPassword = await hashPayload(confirmPassword);

      await this._userRepository.updatePassword(email, hashPassword);

      return AppResponse(null, "Password has been changed successfully", true);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new validationException(error.message);
      }
      throw error;
    }
  }

  public async verifyEmailAddress(token: any) {
    let decode: jwt.JwtPayload;
    try {
      decode = jwt.verify(token, this.JWT_SECRET_KEY) as jwt.JwtPayload;

      const user = await this._userRepository.findByEmail(decode.uid);
      if (!user) {
        throw new badRequestException(
          "Email already not associated with any user",
        );
      }
      if (user.isEmailVerified) {
        throw new badRequestException(
          "Email address has already being verified initially",
        );
      }

      await this._userRepository.updateFieldInDB(user.emailAddress, {
        isEmailVerified: true,
        emailVerifiedAt: formatDate(this.NOW),
      });

      return AppResponse(
        `https://clientsideurl.place.here`, // TODO: Client side url for redirect
        "Email address verified successfully",
        true,
      );
    } catch (error: any) {
      if (error instanceof TokenExpiredError) {
        throw new badRequestException(
          "Invalid token, verification URL has expired",
        );
      }
      throw error;
    }
  }
}
