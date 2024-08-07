import { injectable } from "tsyringe";
import { environment } from "../config";
import { Request, Response } from "express";
import axios from "axios";
import { WalletRepository, UserRepository } from "../repositories";
import { TransactionService } from "./transaction.service";
import { TransactionStatus, TransactionType } from "../interface";
import { generateTransactionReference } from "../utils";
import { badRequestException, logger } from "../helpers";

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

  private async verifyTransactionEvent(payloadId: number) {
    try {
      const response = await this.FLUTTERWAVE_CLIENT.get(
        `transactions/${payloadId}/verify`,
      );

      console.log("Verification data ==>", response.data);

      if (response.data.status !== "success") {
        throw new badRequestException("Transaction could not be verified");
      }

      logger.info("Got here 1");
      return { data: response.data };
    } catch (error: any) {
      console.error("verifyTransactionEventError:", error);
      throw error;
    }
  }

  private async chargeSuccessEvent(
    payloadId: number,
    customerMail: string,
    payloadAmount: number,
  ) {
    try {
      const { data } = await this.verifyTransactionEvent(payloadId);

      logger.info("Got here 2");
      const user = await this._userRepository.findByEmail(customerMail);
      if (!user) {
        console.log("chargeSuccessEventError: User not found");
        throw new badRequestException("User not found");
      }

      logger.info("got here 3");
      const updateWallet = await this._walletRepository.incrementBalance(
        user._id,
        payloadAmount,
      );
      if (!updateWallet) {
        logger.error("An error occurred while updating wallet");
        throw new badRequestException("Balance could not be updated");
      }

      logger.info("got here 4");
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
      logger.info("got here 5");
      const { _id } = await this._walletRepository.getWalletInfo(user._id);

      logger.info(`Data info ==> ${_id}`);

      logger.info("got here 6");
      const transaction = await this._transactionService.createTransaction(
        transactionData,
        _id,
      );
      if (!transaction) {
        console.log("An issue occured while trying to create transaction");
        throw new badRequestException("Transaction could not be updated");
      }
      logger.info("got here 7");

      try {
        logger.info("Got here 8");
        await this._walletRepository.updateTransactionsInWallet(
          _id,
          transaction._id,
        );
        logger.info("Transaction successfully added to wallet");
      } catch (error: any) {
        throw new badRequestException(
          "Wallet could not be updated with transaction",
        );
      }

      logger.info("Transaction successfully processed");
    } catch (error: any) {
      logger.error(`chargeSuccessEventError: ${error}`);
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
        );
      }
    } catch (error: any) {
      logger.error(`handleFlwWebhookEventsError: ${error}`);
      res.status(500).send("Internal server error");
    }
  }
}
