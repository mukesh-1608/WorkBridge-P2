import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";
import { idParamSchema } from "../validators/common.validators";

export const notificationRoutes = Router();

notificationRoutes.use(authMiddleware);

notificationRoutes.get("/", asyncHandler(notificationController.listNotifications));
notificationRoutes.post("/:id/read", validate(idParamSchema), asyncHandler(notificationController.markRead));
notificationRoutes.post("/read-all", asyncHandler(notificationController.markAllRead));
