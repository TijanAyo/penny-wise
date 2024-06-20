import { injectable } from "tsyringe";
import User from "../models/user.model";
import { badRequestException } from "../helpers";

@injectable()
export class AuthRepository {
  async findByEmail(email: string) {
    try {
      return await User.findOne({ emailAddress: email });
    } catch (err: any) {
      console.error("Error looking up user by email:", err);
      throw err;
    }
  }

  async findByPhoneNumber(phoneNumber: string) {
    try {
      return await User.findOne({ phoneNumber });
    } catch (err: any) {
      console.error("Error looking up user by phone-number:", err);
      throw err;
    }
  }

  async findByUsername(username: string) {
    try {
      return await User.findOne({ username });
    } catch (err: any) {
      console.error("Error looking up user by username:", err);
      throw err;
    }
  }

  async createUser(
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
