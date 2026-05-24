import { z } from "zod";

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

export const jobIdParamSchema = z.object({
  params: z.object({
    jobId: z.string().min(1)
  })
});

export const applicationIdParamSchema = z.object({
  params: z.object({
    applicationId: z.string().min(1)
  })
});
