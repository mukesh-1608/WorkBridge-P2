import { UserRole } from "@prisma/client";
import { Router } from "express";
import * as employerController from "../controllers/employer.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { applicationIdParamSchema, jobIdParamSchema } from "../validators/common.validators";
import { createJobSchema, updateJobSchema } from "../validators/job.validators";
import { updateProfileSchema } from "../validators/profile.validators";

export const employerRoutes = Router();

employerRoutes.use(authMiddleware, requireRole(UserRole.EMPLOYER));

employerRoutes.get("/profile", asyncHandler(employerController.getProfile));
employerRoutes.put("/profile", validate(updateProfileSchema), asyncHandler(employerController.updateProfile));
employerRoutes.post("/jobs", validate(createJobSchema), asyncHandler(employerController.createJob));
employerRoutes.get("/jobs", asyncHandler(employerController.listJobs));
employerRoutes.get("/jobs/:jobId", validate(jobIdParamSchema), asyncHandler(employerController.getJob));
employerRoutes.put("/jobs/:jobId", validate(jobIdParamSchema), validate(updateJobSchema), asyncHandler(employerController.updateJob));
employerRoutes.delete("/jobs/:jobId", validate(jobIdParamSchema), asyncHandler(employerController.deleteJob));
employerRoutes.get("/applications", asyncHandler(employerController.listApplications));
employerRoutes.get("/phone-requests", asyncHandler(employerController.listPhoneRequests));
employerRoutes.post(
  "/phone-requests/:applicationId/approve",
  validate(applicationIdParamSchema),
  asyncHandler(employerController.approvePhoneRequest)
);
employerRoutes.post(
  "/phone-requests/:applicationId/reject",
  validate(applicationIdParamSchema),
  asyncHandler(employerController.rejectPhoneRequest)
);
