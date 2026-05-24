"use client";

import type { Role, User } from "@/lib/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
  role: () => Role | null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHydrated: (hydrated) => set({ hydrated }),
      role: () => get().user?.role ?? null
    }),
    {
      name: "juara-workbridge-session",
      onRehydrateStorage: () => (state) => state?.setHydrated(true)
    }
  )
);
