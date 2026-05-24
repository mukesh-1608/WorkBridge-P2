import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { employerRoutes } from "./employer.routes";
import { notificationRoutes } from "./notification.routes";
import { workerRoutes } from "./worker.routes";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/worker", workerRoutes);
apiRoutes.use("/employer", employerRoutes);
apiRoutes.use("/notifications", notificationRoutes);
