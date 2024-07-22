import z from "zod";

export const setTransactionPinSchema = z.object({
  pin: z.string().max(4).trim(),
  confirm_pin: z.string().max(4).trim(),
});

export const setUsernameSchema = z.object({
  username: z.string().trim().max(20).toLowerCase(),
});
