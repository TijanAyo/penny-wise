import { injectable } from "tsyringe";
import User from "../models/user.model";
import { badRequestException } from "../helpers";

@injectable()
export class AuthRepository {
  public async lookUp(email: string) {
    try {
      return await User.findOne({ emailAddress: email });
    } catch (err: any) {
      console.error("Error looking up user by email:", err);
      throw err;
    }
  }

  public async createUser(
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    password: string,
  ) {
    try {
      const user = await User.create({
        emailAddress: email,
        firstName,
        lastName,
        phoneNumber,
        password,
      });

      if (!user) throw new badRequestException("User could not be created");

      return user;
    } catch (err: any) {
      console.error("Error creating user:", err);
      throw err;
    }
  }
}
