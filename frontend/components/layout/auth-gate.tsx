"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Role } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";

export function AuthGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !user) {
      router.replace("/");
      return;
    }
    if (user.role !== role) {
      router.replace(user.role === "WORKER" ? "/worker/dashboard" : "/employer/dashboard");
    }
  }, [hydrated, role, router, token, user]);

  if (!hydrated || !token || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
      </div>
    );
  }

  return children;
}
