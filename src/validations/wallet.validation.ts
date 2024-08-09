import z from "zod";

export const createVirtualAccountNumberSchema = z.object({
  bvn: z.string().trim(),
});

export const disburseSchema = z.object({
  accountBank: z.string().trim(),
  accountNumber: z.string().trim(),
  amount: z.number().positive(),
  narration: z.string().trim(),
  pin: z.string().trim(),
});

export const p2pSchema = z.object({
  username: z.string().trim().toLowerCase(),
  amount: z.number().positive(),
  pin: z.string().trim(),
});

export const withdrawSchema = z.object({
  amount: z.number().positive(),
  pin: z.string().trim(),
  otpCode: z.string().max(7),
});
