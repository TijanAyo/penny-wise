import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { WalletRepository, UserRepository } from "../repositories";
import { TransactionService } from "./transaction.service";
import {
  FlwTransferResponse,
  TransactionStatus,
  TransactionType,
} from "../interface";
import { generateTransactionReference } from "../utils";
import { badRequestException, logger } from "../helpers";
import {
  FLUTTERWAVE_SECRET_HASH,
  FLUTTERWAVE_CLIENT,
} from "../common/flutterwave";

@injectable()
export class WebHookService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
    private readonly _transactionService: TransactionService,
  ) {}

  /**
   * @desc "Verify funding transaction"
   * @param payloadId
   * @returns
   */
  private async verifyFLWTransaction(payloadId: number) {
    try {
      const response = await FLUTTERWAVE_CLIENT.get(
        `/transactions/${payloadId}/verify`,
      );

      if (response.data.status !== "success") {
        throw new badRequestException("Transaction could not be verified");
      }

      return { data: response.data };
    } catch (error: any) {
      logger.error(`verifyFLWTransactionError:, ${error}`);
      throw error;
    }
  }

  /**
   * @desc "Verify tranfer transaction"
   * @param payloadId
   * @returns
   */
  private async verifyFLWTransfer(payloadId: number): Promise<Boolean> {
    try {
      const response = await FLUTTERWAVE_CLIENT.get(`/transfers/${payloadId}`);
      if (response.data.status !== "success") {
        throw new badRequestException("Transfer could not be verified");
      }

      return true;
    } catch (error: any) {
      logger.error(`verifyFLWTransferError:, ${error}`);
      throw error;
    }
  }

  /**
   * @desc "Funding event"
   * @param payloadId
   * @param customerMail
   * @param payloadAmount
   */
  private async chargeSuccessEvent(
    payloadId: number,
    customerMail: string,
    payloadAmount: number,
  ) {
    try {
      const { data } = await this.verifyFLWTransaction(payloadId);

      const user = await this._userRepository.findByEmail(customerMail);
      if (!user) {
        logger.error("chargeSuccessEventError: User not found");
        throw new badRequestException("User not found");
      }

      const updateWallet = await this._walletRepository.incrementBalance(
        user._id,
        payloadAmount,
      );
      if (!updateWallet) {
        logger.error("An error occurred while updating wallet");
        throw new badRequestException("Balance could not be updated");
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
        throw new badRequestException("Transaction could not be updated");
      }

      logger.info("Transaction successfully processed");
    } catch (error: any) {
      logger.error(`chargeSuccessEventError: ${error}`);
      throw error;
    }
  }

  private async transferEvent(payloadId: number) {
    try {
      /* const { data } = await this.verifyFLWTransfer(payloadId);
      const { data } = await this.verifyFLWTransaction(payloadId) */

      const [transferData, transactionData] = await Promise.all([
        this.verifyFLWTransfer(payloadId),
        this.verifyFLWTransaction(payloadId),
      ]);

      console.log("transactionData->>>", transactionData);

      if (!transferData) {
        logger.error("Verification of transfer returned !true");
        throw new badRequestException(
          "An unexpected error has occurred... Kindly try again later",
        );
      }

      const customerEmail = transactionData.data.customer.email;
      const customerDebitAmount = transactionData.data.amount;

      const user = await this._userRepository.findByEmail(customerEmail);
      if (!user) {
        logger.error("transferEventError: Customer email not found in our DB");
        throw new badRequestException(
          "An unexpected error has occured... Kindly try again later",
        );
      }

      const updateWallet = await this._walletRepository.decreaseBalance(
        user._id,
        customerDebitAmount,
      );
      if (!updateWallet) {
        logger.error(
          "TransferEventError: An error occurred while updating wallet",
        );
        throw new badRequestException(
          "An unexpected error has occurred... Kindly try again later",
        );
      }

      const newTransaction = {
        from: `Virtual account transfer`,
        recipient_name: transactionData.data.meta.originatorname as string,
        recipient_bank: transactionData.data.meta.bankname as string,
        amount_credited: String(customerDebitAmount),
        type: TransactionType.DISBURSE,
        status: TransactionStatus.SUCCESSFUL,
        reference: generateTransactionReference(),
        description: `Withdrawal from wallet to bank account ${transactionData.data.meta.originatoraccountnumber}`,
      };

      const { _id } = await this._walletRepository.getWalletInfo(user._id);
      const transaction = await this._transactionService.createTransaction(
        newTransaction,
        _id,
      );

      if (!transaction) {
        logger.error(
          "TransferEventError: An issue occured while trying to create transaction",
        );
        throw new badRequestException(
          "An unexpected error has occurred... Kindly try again later",
        );
      }

      // send email notification on withdrawal

      logger.info("Transfer was successfully processed");
    } catch (error: any) {
      logger.error(`transferEventError: ${error}`);
      throw error;
    }
  }

  public async handleFlwWebhookEvents(req: Request, res: Response) {
    try {
      if (FLUTTERWAVE_SECRET_HASH != req.headers["verif-hash"]) {
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

      if (payload.event == "transfer.completed") {
        await this.transferEvent(payload.data.id);
      }
    } catch (error: any) {
      logger.error(`handleFlwWebhookEventsError: ${error}`);
      res.status(500).send("Internal server error");
    }
  }
}
