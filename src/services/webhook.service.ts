import { injectable } from "tsyringe";
import { environment } from "../config";
import { Request, Response } from "express";
import axios from "axios";
import { WalletRepository, UserRepository } from "../repositories";
import { TransactionService } from "./transaction.service";
import { TransactionStatus, TransactionType } from "../interface";
import { generateTransactionReference } from "../utils";

@injectable()
export class WebHookService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
    private readonly _transactionService: TransactionService,
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
    try {
      const { data } = await this.verifyTransactionEvent(payloadId, res);

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

      const transactionData = {
        from: `Virtual account transfer`,
        recipient_name: data.data.meta.originatorname as string,
        recipient_bank: data.data.meta.bankname as string,
        amount_credited: String(payloadAmount),
        type: TransactionType.FUNDING,
        status: TransactionStatus.SUCCESSFUL,
        reference: generateTransactionReference(),
        description: `Transfer to wallet from bank account ${data.data.meta.originatoraccountnumber} - ${data.data.meta.originatorname}`,
      };
      const { _id } = await this._walletRepository.getWalletInfo(user._id);

      const transaction = await this._transactionService.createTransaction(
        transactionData,
        _id,
      );
      if (!transaction) {
        console.log("An issue occured while trying to create transaction");
        res.status(401).send("Transaction could not be updated").end();
      }

      // Update wallet transactions
      await this._walletRepository.updateTransactionsInWallet(
        _id,
        transaction._id,
      );

      res.status(200).send("Transaction successfully processed");
    } catch (error: any) {
      console.error("chargeSuccessEventError:", error);
      res.status(500).send("Internal server error");
    }
  }

  private async verifyTransactionEvent(payloadId: number, res: Response) {
    try {
      const response = await this.FLUTTERWAVE_CLIENT.get(
        `transactions/${payloadId}/verify`,
      );

      console.log("Verification data ==>", response.data);

      if (response.data.status !== "successful") {
        res.status(401).send("Transaction could not be verified").end();
      }

      return { data: response.data };
    } catch (error: any) {
      console.error("verifyTransactionEventError:", error);
      throw error;
    }
  }

  public async handleFlwWebhookEvents(req: Request, res: Response) {
    try {
      if (this.FLUTTERWAVE_SECRET_HASH != req.headers["verif-hash"]) {
        // This request isn't from Flutterwave; discard
        res.status(401).end();
      }

      // Send immediate confirmation to Flutterwave
      res.status(200).send("Webhook received");
      const payload = req.body;

      console.log("payload==>", payload);

      // Handle the charge.completed event
      if (payload.event == "charge.completed") {
        await this.chargeSuccessEvent(
          payload.data.id,
          payload.data.customer.email,
          payload.data.amount,
          res,
        );
      }
    } catch (error: any) {
      console.error("handleFlwWebhookEventsError:", error);
      res.status(500).send("Internal server error");
    }
  }
}
