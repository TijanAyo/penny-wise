import { injectable } from "tsyringe";

@injectable()
export class WalletService {
  public async createVirtualAccountNumber() {
    // Implementation for creating a virtual account number using Fincra
  }

  public async getVirtualAccountDetails() {}

  public async disburse() {}

  public async p2pTransfer() {}

  public async withdraw() {}
}
