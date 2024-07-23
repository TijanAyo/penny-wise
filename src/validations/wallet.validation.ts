import z from "zod";

export const createVirtualAccountNumberSchema = z.object({
  bvn: z.string().trim(),
});

export const disburseSchema = z.object({
  accountBank: z.string().trim(),
  accountNumber: z.string().trim(),
  amount: z.number(),
  narration: z.string().trim(),
  pin: z.string().trim(),
});
