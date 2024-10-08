import { injectable } from "tsyringe";
import { Request, Response } from "express";
import {
  WalletRepository,
  UserRepository,
  TransactionRepository,
} from "../repositories";
import { TransactionStatus, TransactionType } from "../common/interface";
import { formatDate, generateTransactionReference } from "../utils";
import { badRequestException, logger } from "../helpers";
import {
  FLUTTERWAVE_SECRET_HASH,
  FLUTTERWAVE_CLIENT,
} from "../common/flutterwave";
import { EmailQueue } from "../common/queues";

@injectable()
export class WebHookService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _walletRepository: WalletRepository,
    private readonly _transactionRepository: TransactionRepository,
    private readonly _emailQueueService: EmailQueue,
  ) {}

  /**
   * @desc "Verify FLW transaction"
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

      logger.info(`verifyTransaction:, ${response.data}`);

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
  private async verifyFLWTransfer(payloadId: number) {
    try {
      const response = await FLUTTERWAVE_CLIENT.get(`/transfers/${payloadId}`);
      if (response.data.status !== "success") {
        throw new badRequestException("Transfer could not be verified");
      }

      const transferRef: string = response.data.data.reference;
      const result =
        await this._walletRepository.retrieveTransactionRef(transferRef);

      const data = {
        debit_amount: response.data.data.amount,
        narration: response.data.data.narration,
        bank_name: response.data.data.bank_name,
        full_name: response.data.data.full_name,
        result,
      };

      return { success: true, data };
    } catch (error: any) {
      logger.error(`verifyFLWTransferError:, ${error}`);
      throw error;
    }
  }

  /**
   * @desc "Funding event occurred"
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

      const generatedReference = generateTransactionReference("funding");
      const newTransaction = {
        from: `Virtual account transfer`,
        recipient_name: data.data.meta.originatorname as string,
        recipient_bank: data.data.meta.bankname as string,
        amount_credited: String(payloadAmount),
        type: TransactionType.FUNDING,
        status: TransactionStatus.SUCCESSFUL,
        reference: generatedReference,
        description: `Transfer to wallet from bank account ${data.data.meta.originatoraccountnumber} - ${data.data.meta.originatorname}`,
      };

      const transaction = await this._transactionRepository.generateWalletTrx(
        user._id,
        newTransaction,
      );
      if (!transaction) {
        console.log("An issue occured while trying to create transaction");
        throw new badRequestException("Transaction could not be updated");
      }

      const emailForQueue = user.emailAddress;
      const queueData = {
        name: user.firstName,
        alert_type: "Credit",
        account_name: newTransaction.recipient_name,
        description: newTransaction.description,
        reference_number: newTransaction.reference,
        transaction_amount: newTransaction.amount_credited,
        transaction_date: formatDate(new Date()),
      };

      const {
        name,
        alert_type,
        account_name,
        description,
        reference_number,
        transaction_amount,
        transaction_date,
      } = queueData;

      await this._emailQueueService.sendEmailQueue({
        type: "alert",
        payload: {
          email: emailForQueue,
          name,
          alert_type,
          account_name,
          description,
          reference_number,
          transaction_amount,
          transaction_date,
        },
      });

      logger.info("Transaction successfully processed");
    } catch (error: any) {
      logger.error(`chargeSuccessEventError: ${error}`);
      throw error;
    }
  }

  /**
   * @desc "Handle disburse events"
   * @param payloadId
   */
  private async transferEvent(payloadId: number) {
    try {
      const verifyTransferData = await this.verifyFLWTransfer(payloadId);

      if (!verifyTransferData.success) {
        logger.error("Verification of transfer returned !true");
        throw new badRequestException(
          "An unexpected error has occurred... Kindly try again later",
        );
      }

      const customerEmail = verifyTransferData.data.result.data;
      const customerDebitAmount = verifyTransferData.data.debit_amount;

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

      const generatedReference = generateTransactionReference("transfer");
      const newTransaction = {
        from: `Virtual account transfer`,
        recipient_name: verifyTransferData.data.full_name,
        recipient_bank: verifyTransferData.data.bank_name,
        amount_debited: String(customerDebitAmount),
        type: TransactionType.DISBURSE,
        status: TransactionStatus.SUCCESSFUL,
        reference: generatedReference,
        description: `Withdrawal from wallet to bank account`,
      };

      const transaction = await this._transactionRepository.generateWalletTrx(
        user._id,
        newTransaction,
      );

      if (!transaction) {
        logger.error(
          "TransferEventError: An issue occured while trying to create transaction for wallet",
        );
        throw new badRequestException(
          "An unexpected error has occurred... Kindly try again later",
        );
      }

      const emailForQueue = user.emailAddress;
      const queueData = {
        name: user.firstName,
        alert_type: "Debit",
        account_name: newTransaction.recipient_name,
        description: newTransaction.description,
        reference_number: newTransaction.reference,
        transaction_amount: newTransaction.amount_debited,
        transaction_date: formatDate(new Date()),
      };

      const {
        name,
        alert_type,
        account_name,
        description,
        reference_number,
        transaction_amount,
        transaction_date,
      } = queueData;

      await this._emailQueueService.sendEmailQueue({
        type: "alert",
        payload: {
          email: emailForQueue,
          name,
          alert_type,
          account_name,
          description,
          reference_number,
          transaction_amount,
          transaction_date,
        },
      });

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
