import { injectable } from "tsyringe";
import {
  AppResponse,
  badRequestException,
  validationException,
} from "../helpers";
import { AuthRepository } from "../repositories";
import {
  forgotPasswordPayload,
  loginPayload,
  registerPayload,
} from "../interface";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "../validations";
import { ZodError } from "zod";
import { compareHash, generateAccessToken, hashPayload } from "../utils";

@injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  public async register(payload: registerPayload) {
    try {
      const { email, firstName, lastName, phoneNumber, password } =
        await registerSchema.parseAsync(payload);
      const user = await this.authRepository.findByEmail(email);
      if (user) {
        throw new badRequestException(
          "Email already associated with another user. Kindly specify a different email",
        );
      }

      // Hash the password
      const hashPassword = await hashPayload(password);

      // Create user
      await this.authRepository.createUser(
        email,
        firstName,
        lastName,
        phoneNumber,
        hashPassword,
      );

      // TODO: Send a verification mail to the user

      return AppResponse(null, "Account registeration successful", true);
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
        user = await this.authRepository.findByEmail(email);
      } else if (username) {
        user = await this.authRepository.findByUsername(username);
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
        user = await this.authRepository.findByEmail(email);
      }

      if (!user) {
        throw new badRequestException("Invalid credentials, kindly try again");
      }

      // create random 6 digit code
      //  store random code on redis for temporary storage

      // queue sending mail to user

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

  public async resetPassword() {
    // validate input
    // create a validate otp middleware
    // - This will check the input of the user with the otp value stored on redis
    // - If this is successful
    // - Hash new password and save to database
    // -If not successful
    // - Return an invalid OTP, check input and try again
    // check the provided
  }
}
