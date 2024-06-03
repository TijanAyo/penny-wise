import { AppResponse } from "../helpers";

export class AuthService {
  /**
   * @desc This allows the client to look up the email address of the user
   * to make sure the email address is not associated with any other user.
   */
  public async lookUp(payload: any) {
    try {
      // code goes here
      return AppResponse(null, "This is the lookUp service", true);
    } catch (err: any) {
      throw err;
    }
  }

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
