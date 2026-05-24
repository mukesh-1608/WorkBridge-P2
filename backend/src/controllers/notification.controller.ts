import type { Request, Response } from "express";
import * as notificationService from "../services/notification.service";

const userId = (req: Request) => req.user!.id;
const param = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

export const listNotifications = async (req: Request, res: Response) => {
  const notifications = await notificationService.listNotifications(userId(req));
  res.json({ success: true, data: notifications });
};

export const markRead = async (req: Request, res: Response) => {
  const notification = await notificationService.markNotificationRead(userId(req), param(req.params.id));
  res.json({ success: true, data: notification });
};

export const markAllRead = async (req: Request, res: Response) => {
  const notifications = await notificationService.markAllNotificationsRead(userId(req));
  res.json({ success: true, data: notifications });
};
