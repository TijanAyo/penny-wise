import { injectable } from "tsyringe";
import { Types } from "mongoose";
import { UserRepository, WalletRepository } from "../repositories";
import { AppResponse, badRequestException } from "../helpers";

@injectable()
export class WalletService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
  ) {}

  public async getVirtualAccountDetails(userId: Types.ObjectId) {
    try {
      const user = await this._userRepository.findByUserId(userId);
      if (!user) {
        console.log("getVirtualAccountDetailsError: User not found");
        throw new badRequestException("User not found");
      }

      const walletInfo = await this._walletRepository.getWalletInfo(userId);
      if (!walletInfo) {
        throw new badRequestException("Wallet information not found");
      }
      return AppResponse(
        walletInfo,
        "Wallet information retrieved successfully",
        true,
      );
    } catch (error: any) {
      throw error;
    }
  }

  public async disburse() {
    // Check if the user balance is able to make such transaction
    // the receiver bank and account number
  }

  public async p2pTransfer() {}

  public async withdraw() {}
}
