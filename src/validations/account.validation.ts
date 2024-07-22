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

export const changePasswordSchema = z.object({
  oldPassword: z.string().trim().max(20),
  newPassword: z.string().trim().max(20),
  confirmPassword: z.string().trim().max(20),
  otp: z.string().trim().min(6).max(6),
});

export const createOtpSchema = z.object({
  reason: z.enum(["PIN_CHANGE", "PASSWORD_CHANGE"]),
});

export const updateProfileInfoSchema = z.object({
  username: z.string().trim().toLowerCase().optional(),
  gender: z.string().trim().toLowerCase().optional(),
  address: z
    .object({
      streetAddress: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
    })
    .optional(),
  nextOfKin: z
    .object({
      firstName: z.string().max(20).trim().toLowerCase().optional(),
      lastName: z.string().max(20).trim().toLowerCase().optional(),
      emailAddress: z.string().email().trim().optional(),
      relationship: z.string().max(20).trim().toLowerCase().optional(),
      gender: z.string().max(20).trim().toLowerCase().optional(),
      phoneNumber: z.string().max(20).trim().toLowerCase().optional(),
      accountNumber: z.string().max(20).trim().toLowerCase().optional(),
      accountName: z.string().max(20).trim().toLowerCase().optional(),
      bankName: z.string().max(20).trim().toLowerCase().optional(),
      city: z.string().max(20).trim().toLowerCase().optional(),
      country: z.string().max(20).trim().toLowerCase().optional(),
      state: z.string().max(20).trim().toLowerCase().optional(),
    })
    .optional(),
});
