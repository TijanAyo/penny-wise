import * as dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.string(),
  MONGO_URI: z.string(),
  LOCAL_MONGO_URI: z.string(),
  PORT: z.string(),
  SALT_ROUND: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  RESEND_ACCESS_KEY: z.string(),
  MAILER_EMAIL_ADDRESS: z.string(),
});

export const environment = environmentSchema.parse(process.env);
