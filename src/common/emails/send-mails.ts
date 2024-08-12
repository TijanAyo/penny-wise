import renderTemplate from "./render-template";
import mailer from "../../config/mailer";
import { injectable } from "tsyringe";
import { alertPayload } from "../interface";

@injectable()
export class SendMails {
  public async forgotPasswordMail(
    email: string,
    firstName: string,
    otp_code: string,
  ) {
    const emailSubject: string = `Your One Time Passcode`;
    const emailBody = renderTemplate("forgot-password", {
      firstName,
      otp_code,
    });

    await mailer(email, emailSubject, emailBody);
  }

  public async emailVerificationMail(email: string, verificationUrl: string) {
    const emailSubject: string = "Verify Your Email Address";
    const emailBody = renderTemplate("email-verification", {
      verification_link: verificationUrl,
    });

    await mailer(email, emailSubject, emailBody);
  }

  public async createOtpMail(email: string, otp_code: string) {
    const emailSubject: string = `Pennywise Confirmation Code`;
    const emailBody = renderTemplate("create-otp", {
      otp_code,
    });

    await mailer(email, emailSubject, emailBody);
  }

  public async credentialNotificationMail(email: string, reason: string) {
    const emailSubject: string = `${reason} Changed Successfully`;
    const emailBody = renderTemplate("credential-notification", { reason });

    await mailer(email, emailSubject, emailBody);
  }

  public async sendAlertMail(
    email: string,
    name: string,
    alert_type: string,
    account_name: string,
    description: string,
    reference_number: string,
    transaction_amount: string,
    transaction_date: string,
  ) {
    const emailSubject: string = `PennyWise Alert`;
    const emailBody = renderTemplate("alert", {
      name,
      alert_type,
      account_name,
      description,
      reference_number,
      transaction_amount,
      transaction_date,
    });

    console.log("email from sendAlertMail:", email);
    console.log("data from sendAlertMail:", name);

    await mailer(email, emailSubject, emailBody);
  }
}
