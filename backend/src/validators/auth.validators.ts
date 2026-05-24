import { UserRole } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    role: z.nativeEnum(UserRole),
    phone: z.string().min(6).max(20),
    otp: z.string().length(4),
    name: z.string().min(2).max(120).optional(),
    state: z.string().min(2).max(120).optional()
  })
});
