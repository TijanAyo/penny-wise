import * as dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.string(),
  MONGO_URI: z.string(),
  LOCAL_MONGO_URI: z.string(),
  PORT: z.string(),
});

export const environment = environmentSchema.parse(process.env);
