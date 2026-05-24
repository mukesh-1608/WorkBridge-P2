import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middleware/validate.middleware";
import { loginSchema } from "../validators/auth.validators";

export const authRoutes = Router();

authRoutes.post("/login", validate(loginSchema), asyncHandler(authController.login));
