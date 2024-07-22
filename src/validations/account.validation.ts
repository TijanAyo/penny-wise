import z from "zod";

export const setTransactionPinSchema = z.object({
  pin: z.string().max(4).trim(),
  confirm_pin: z.string().max(4).trim(),
});

export const setUsernameSchema = z.object({
  username: z.string().trim().max(20).toLowerCase(),
});

export const addNextOfKinSchema = z.object({
  firstName: z.string().max(20).trim().toLowerCase(),
  lastName: z.string().max(20).trim().toLowerCase(),
  emailAddress: z.string().email().trim(),
  relationship: z.string().max(20).trim().toLowerCase(),
  gender: z.string().max(20).trim().toLowerCase(),
  phoneNumber: z.string().max(20).trim().toLowerCase(),
  accountNumber: z.string().max(20).trim().toLowerCase(),
  accountName: z.string().max(20).trim().toLowerCase(),
  bankName: z.string().max(20).trim().toLowerCase(),
  city: z.string().max(20).trim().toLowerCase(),
  country: z.string().max(20).trim().toLowerCase(),
  state: z.string().max(20).trim().toLowerCase(),
});
