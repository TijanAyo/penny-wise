import { injectable } from "tsyringe";
import {
  AppResponse,
  badRequestException,
  validationException,
} from "../helpers";
import { AuthRepository } from "../repositories";
import { registerPayload } from "../interface";
import { registerSchema } from "../validations";
import { ZodError } from "zod";
import { hashPayload } from "../utils";

@injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  public async register(payload: registerPayload) {
    try {
      const { email, firstName, lastName, phoneNumber, password } =
        await registerSchema.parseAsync(payload);
      const user = await this.authRepository.lookUp(email);
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

      return AppResponse(null, "Account registeration successful", true);
    } catch (err: any) {
      if (err instanceof ZodError) {
        throw new validationException(err.message);
      }
      throw err;
    }
  }

  public async login(payload: any) {
    try {
      // code goes here
      return AppResponse(null, "This is the login service", true);
    } catch (err: any) {
      throw err;
    }
  }
}
