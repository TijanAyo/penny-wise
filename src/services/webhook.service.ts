import { injectable } from "tsyringe";
import { environment } from "../config";
import { Request, Response } from "express";
import axios from "axios";
import { WalletRepository, UserRepository } from "../repositories";

@injectable()
export class WebHookService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
  ) {}

  private readonly FLUTTERWAVE_BASE_URL = `https://api.flutterwave.com/v3`;
  private readonly FLUTTERWAVE_SECRET_HASH =
    environment.FLUTTERWAVE_SECRET_HASH;
  private readonly FLUTTERWAVE_HEADER_CONFIG = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${environment.FLUTTERWAVE_SECRET_KEY}`,
  };
  private readonly FLUTTERWAVE_CLIENT = axios.create({
    baseURL: this.FLUTTERWAVE_BASE_URL,
    headers: this.FLUTTERWAVE_HEADER_CONFIG,
  });

  private async chargeSuccessEvent(
    payloadId: number,
    customerMail: string,
    payloadAmount: number,
    res: Response,
  ) {
    await this.verifyTransactionEvent(payloadId, res);

    const user = await this._userRepository.findByEmail(customerMail);
    if (!user) {
      console.log("chargeSuccessEventError: User not found");
      res.status(401).send("User not found").end();
    }

    const updateWallet = await this._walletRepository.incrementBalance(
      user._id,
      payloadAmount,
    );
    if (!updateWallet) {
      console.log("An error occurred while updating wallet");
      res.status(401).send("Balance could not be updated").end();
    }

    // Call the verifyTransactionEvent method to verify the transaction  -- done
    // Update the wallet balance with the transfered amount -- done
    // find the user whose wallet email matches the customer info --- done
    // use the incr method to increase the balance --- done
    // call the create transaction service
  }

  private async verifyTransactionEvent(payloadId: number, res: Response) {
    const response = await this.FLUTTERWAVE_CLIENT.get(
      `transactions/${payloadId}/verify`,
    );

    console.log(response.data);

    if (response.data.status !== "successful") {
      res.status(401).send("Transaction could not be verified").end();
    }

    return;
  }

  public async handleFlwWebhookEvents(req: Request, res: Response) {
    if (this.FLUTTERWAVE_SECRET_HASH != req.headers["verif-hash"]) {
      // This request isn't from Flutterwave; discard
      res.status(401).end();
    }

    // Send confirmation to flutterwave
    res.status(200);
    const payload = req.body;

    if (payload.event == "charge.completed") {
      await this.chargeSuccessEvent(
        payload.data.id,
        payload.data.customer.email,
        payload.data.amount,
        res,
      );
    }

    // Do something with the event that was sent
  }
}
