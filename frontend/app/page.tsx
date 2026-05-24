"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { Role } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const push = useToast((state) => state.push);
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [role, setRole] = useState<Role>("WORKER");
  const [name, setName] = useState("Worker User");
  const [phone, setPhone] = useState("9876543210");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [otp, setOtp] = useState("1234");

  useEffect(() => {
    if (!hydrated || !user) return;
    router.replace(user.role === "WORKER" ? "/worker/dashboard" : "/employer/dashboard");
  }, [hydrated, router, user]);

  const login = useMutation({
    mutationFn: () => apiClient.login({ role, name, phone, state: stateName, otp }),
    onSuccess: ({ data }) => {
      setSession(data.token, data.user);
      push({ tone: "success", title: "Signed in", description: `Welcome back, ${data.user.name}.` });
      router.replace(data.user.role === "WORKER" ? "/worker/dashboard" : "/employer/dashboard");
    },
    onError: (error) => push({ tone: "error", title: "Login failed", description: error.message })
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate();
  };

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm text-slate-600 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-slate-950" />
            Premium workforce operations
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">Juara WorkBridge</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
            A calm, polished workspace for connecting trusted workers with employers who need reliable local talent.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Verified access", "Live updates", "Fast hiring"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/80 bg-white/62 p-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
      <section className="flex items-center justify-center px-4 py-8 sm:px-8">
        <Card className="w-full max-w-md bg-white/84">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Sign in</h2>
                <p className="text-sm text-slate-500">OTP is `1234` for this environment.</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={submit}>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Role
                <Select
                  value={role}
                  onChange={(event) => {
                    const nextRole = event.target.value as Role;
                    setRole(nextRole);
                    setName(nextRole === "WORKER" ? "Worker User" : "Employer User");
                    setPhone(nextRole === "WORKER" ? "9876543210" : "9999999999");
                  }}
                >
                  <option value="WORKER">Worker</option>
                  <option value="EMPLOYER">Employer</option>
                </Select>
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Name
                <Input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Phone
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                State
                <Input value={stateName} onChange={(event) => setStateName(event.target.value)} required />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                OTP
                <Input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" required />
              </label>
              <Button className="w-full" size="lg" disabled={login.isPending}>
                {login.isPending ? "Signing in..." : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
