import z from "zod";

export const registerSchema = z.object({
  // TODO: Add the userAgent and ip-address of the user during registeration
  email: z.string().email().trim().toLowerCase(),
  firstName: z.string().trim().max(20).trim().toLowerCase(),
  lastName: z.string().max(20).trim().toLowerCase(),
  phoneNumber: z.string().trim().max(20).trim(),
  password: z.string().trim().max(20).trim(),
});

export const loginSchema = z
  .object({
    email: z.string().email().trim().toLowerCase().optional(),
    username: z.string().trim().trim().optional(),
    phoneNumber: z.string().trim().optional(),
    password: z.string().trim().trim(),
  })
  .refine((data) => data.email || data.phoneNumber || data.username, {
    message: "One of email, phoneNumber, or username must be provided",
  });
