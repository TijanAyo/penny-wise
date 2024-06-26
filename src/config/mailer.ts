import { Resend } from "resend";
import { environment } from "./environment";

const { RESEND_ACCESS_KEY, MAILER_EMAIL_ADDRESS } = environment;
const resend = new Resend(RESEND_ACCESS_KEY);

const mailer = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `PennyWise <${MAILER_EMAIL_ADDRESS}>`,
    to,
    subject,
    html,
  };

  try {
    const email = await resend.emails.send(mailOptions);
    console.log(email);
  } catch (err: any) {
    console.log(err);
  }
};

export default mailer;
