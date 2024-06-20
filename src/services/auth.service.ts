import { injectable } from "tsyringe";
import { AppResponse } from "../helpers";

@injectable()
export class AuthService {
  public async register(payload: any) {
    try {
      // code goes here
      return AppResponse(null, "This is the register service", true);
    } catch (err: any) {
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
