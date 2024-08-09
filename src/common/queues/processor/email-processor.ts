import { injectable } from "tsyringe";
import { SendMails } from "../../emails";

@injectable()
export class EmailProcessor {
  constructor(private readonly mailService: SendMails) {}

  async forgotMailWorker(job: {
    email: string;
    firstName: string;
    otp: string;
  }) {
    try {
      const { email, firstName, otp } = job;
      await this.mailService.forgotPasswordMail(email, firstName, otp);
    } catch (err: any) {
      console.log(
        "ForgotPasswordWorker: An error occurred processing job",
        err,
      );
      throw err;
    }
  }

  async emailVerificationWorker(job: {
    email: string;
    verificationURL: string;
  }) {
    try {
      const { email, verificationURL } = job;
      await this.mailService.emailVerificationMail(email, verificationURL);
    } catch (err: any) {
      console.log(
        "emailVerificationWorker: An error occurred processing job",
        err,
      );
      throw err;
    }
  }

  async createOtpWorker(job: { email: string; otp: string }) {
    try {
      const { email, otp } = job;
      await this.mailService.createOtpMail(email, otp);
    } catch (err: any) {
      console.log("createOtpWorker: An error occurred processing job", err);
      throw err;
    }
  }

  async credentialChangeNotificationWorker(job: {
    email: string;
    reason: string;
  }) {
    try {
      const { email, reason } = job;
      await this.mailService.credentialNotificationMail(email, reason);
    } catch (err: any) {
      console.log(
        "credentialChangeNotificationWorker: An error occurred processing job",
        err,
      );
      throw err;
    }
  }
}
