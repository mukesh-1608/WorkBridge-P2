import { UserRole } from "@prisma/client";
import { prisma } from "../prisma/client";
import { HttpError } from "../utils/http-error";
import { signAuthToken } from "../utils/jwt";

type LoginInput = {
  role: UserRole;
  phone: string;
  otp: string;
  name?: string;
  state?: string;
};

export const login = async (input: LoginInput) => {
  if (input.otp !== "1234") {
    throw new HttpError(401, "Invalid OTP");
  }

  const user = await prisma.user.upsert({
    where: { phone: input.phone },
    update: {
      role: input.role,
      name: input.name ?? `${input.role === UserRole.WORKER ? "Worker" : "Employer"} User`,
      state: input.state ?? "Tamil Nadu",
      isActive: true
    },
    create: {
      role: input.role,
      phone: input.phone,
      name: input.name ?? `${input.role === UserRole.WORKER ? "Worker" : "Employer"} User`,
      state: input.state ?? "Tamil Nadu"
    }
  });

  if (input.role === UserRole.WORKER) {
    await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });
  }

  if (input.role === UserRole.EMPLOYER) {
    await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });
  }

  const token = signAuthToken({ userId: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      state: user.state,
      isActive: user.isActive
    }
  };
};
