import { UserRole } from "@prisma/client";
import { prisma } from "../prisma/client";
import { HttpError } from "../utils/http-error";

export const getUserProfile = async (userId: string, role: UserRole) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, role, isActive: true },
    include: {
      workerProfile: role === UserRole.WORKER,
      employerProfile: role === UserRole.EMPLOYER
    }
  });

  if (!user) {
    throw new HttpError(404, "Profile not found");
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  role: UserRole,
  input: { name?: string; state?: string; phone?: string }
) => {
  const existing = await getUserProfile(userId, role);

  return prisma.user.update({
    where: { id: existing.id },
    data: {
      name: input.name,
      state: input.state,
      phone: input.phone
    }
  });
};
