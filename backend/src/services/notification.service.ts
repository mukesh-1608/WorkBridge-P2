import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { HttpError } from "../utils/http-error";

export const createNotification = async (input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
}) => {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata
    }
  });
};

export const listNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
};

export const markNotificationRead = async (userId: string, id: string) => {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) {
    throw new HttpError(404, "Notification not found");
  }

  return prisma.notification.update({
    where: { id },
    data: { readAt: new Date() }
  });
};

export const markAllNotificationsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() }
  });

  return listNotifications(userId);
};
