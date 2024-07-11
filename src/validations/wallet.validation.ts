import z from "zod";

export const createVirtualAccountNumberSchema = z.object({
  bvn: z.string().trim(),
});
