import renderTemplate from "./render-template";
import mailer from "../config/mailer";
import { injectable } from "tsyringe";

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
}
