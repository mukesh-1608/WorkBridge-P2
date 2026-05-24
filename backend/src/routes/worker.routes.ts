import { UserRole } from "@prisma/client";
import { Router } from "express";
import * as workerController from "../controllers/worker.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { jobIdParamSchema } from "../validators/common.validators";
import { updateProfileSchema } from "../validators/profile.validators";

export const workerRoutes = Router();

workerRoutes.use(authMiddleware, requireRole(UserRole.WORKER));

workerRoutes.get("/profile", asyncHandler(workerController.getProfile));
workerRoutes.put("/profile", validate(updateProfileSchema), asyncHandler(workerController.updateProfile));
workerRoutes.get("/jobs", asyncHandler(workerController.listJobs));
workerRoutes.get("/jobs/:jobId", validate(jobIdParamSchema), asyncHandler(workerController.getJob));
workerRoutes.post("/jobs/:jobId/apply", validate(jobIdParamSchema), asyncHandler(workerController.applyToJob));
workerRoutes.get("/applications", asyncHandler(workerController.listApplications));
workerRoutes.post(
  "/jobs/:jobId/request-phone",
  validate(jobIdParamSchema),
  asyncHandler(workerController.requestPhone)
);
workerRoutes.get("/phone-requests", asyncHandler(workerController.listPhoneRequests));
