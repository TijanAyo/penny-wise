import z from "zod";

export const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  firstName: z.string().trim().max(20).trim().toLowerCase(),
  lastName: z.string().trim().max(20).trim().toLowerCase(),
  phoneNumber: z.string().trim().max(20).trim(),
  password: z.string().trim().max(20).trim(),
});
