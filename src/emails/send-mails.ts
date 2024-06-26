import renderTemplate from "./render-template";
import mailer from "../config/mailer";

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
}
