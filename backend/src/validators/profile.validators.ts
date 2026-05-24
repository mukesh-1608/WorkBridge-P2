import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    state: z.string().min(2).max(120).optional(),
    phone: z.string().min(6).max(20).optional()
  })
});
