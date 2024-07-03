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
    const emailSubject: string = `YOUR ONE TIME PASSCODE`;
    const emailBody = renderTemplate("forgot-password", {
      firstName,
      otp_code,
    });

    await mailer(email, emailSubject, emailBody);
  }

  public async emailVerificationMail(email: string, verificationUrl: string) {
    const emailSubject: string = "VERIFY YOUR EMAIL ADDRESS";
    const emailBody = renderTemplate("email-verification", {
      verification_link: verificationUrl,
    });

    await mailer(email, emailSubject, emailBody);
  }
}
