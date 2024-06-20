import bcrypt from "bcrypt";
import { environment } from "../config";

export const hashPayload = async (data: string) => {
  return bcrypt.hash(data, Number(environment.SALT_ROUND));
};
