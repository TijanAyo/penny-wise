import { injectable } from "tsyringe";
import {
  AppResponse,
  badRequestException,
  validationException,
} from "../helpers";
import { AuthRepository } from "../repositories";
import { loginPayload, registerPayload } from "../interface";
import { loginSchema, registerSchema } from "../validations";
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
    } catch (err: any) {
      if (err instanceof ZodError) {
        throw new validationException(err.message);
      }
      throw err;
    }
  }

  public async login(payload: loginPayload) {
    try {
      const { email, phoneNumber, username, password } =
        await loginSchema.parseAsync(payload);

      let user;

      if (email) {
        user = await this.authRepository.findByEmail(email);
      } else if (phoneNumber) {
        user = await this.authRepository.findByPhoneNumber(phoneNumber);
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
        "This is the login service",
        true,
      );
    } catch (err: any) {
      if (err instanceof ZodError) {
        throw new validationException(err.message);
      }
      throw err;
    }
  }
}
