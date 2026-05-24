import { JobStatus } from "@prisma/client";
import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1),
    subcategoryId: z.string().min(1),
    title: z.string().min(3).max(160),
    description: z.string().min(10).max(5000),
    location: z.string().min(2).max(160),
    state: z.string().min(2).max(120),
    wage: z.number().int().positive(),
    wageType: z.string().min(2).max(40),
    jobType: z.string().min(2).max(80),
    status: z.nativeEnum(JobStatus).optional()
  })
});

export const updateJobSchema = z.object({
  body: createJobSchema.shape.body.partial()
});
