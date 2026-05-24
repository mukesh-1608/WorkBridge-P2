import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error";

export const requireRole =
  (role: UserRole) => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    if (req.user.role !== role) {
      throw new HttpError(403, "You do not have permission to access this resource");
    }

    next();
  };
