"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BriefcaseBusiness, ClipboardList, Home, LogOut, PhoneCall, Plus, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";

const workerNav = [
  { href: "/worker/dashboard", label: "Dashboard", icon: Home },
  { href: "/worker/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/worker/applications", label: "Applications", icon: ClipboardList },
  { href: "/worker/phone-requests", label: "Phone", icon: PhoneCall },
  { href: "/worker/notifications", label: "Notifications", icon: Bell }
];

const employerNav = [
  { href: "/employer/dashboard", label: "Dashboard", icon: Home },
  { href: "/employer/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/employer/jobs/new", label: "New Job", icon: Plus },
  { href: "/employer/phone-requests", label: "Phone", icon: PhoneCall },
  { href: "/employer/notifications", label: "Notifications", icon: Bell }
];

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const nav = role === "WORKER" ? workerNav : employerNav;

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/70 bg-white/70 px-3 py-4 shadow-sm backdrop-blur-xl lg:block">
        <Link href={role === "WORKER" ? "/worker/dashboard" : "/employer/dashboard"} className="flex items-center gap-3 rounded-2xl px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">JW</div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Juara WorkBridge</p>
            <p className="text-xs text-slate-500">{role === "WORKER" ? "Worker workspace" : "Employer workspace"}</p>
          </div>
        </Link>
        <nav className="mt-6 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href.endsWith("/jobs") && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950",
                  active && "text-slate-950"
                )}
              >
                {active ? <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-2xl bg-white shadow-sm" /> : null}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/68 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{role.toLowerCase()} portal</p>
              <h1 className="truncate text-base font-semibold text-slate-950">{user?.name ?? "Welcome"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-sm text-slate-600 shadow-sm sm:flex">
                <UserRound className="h-4 w-4" />
                {user?.phone}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 gap-1 rounded-3xl border border-white/70 bg-white/84 p-1 shadow-glass backdrop-blur-xl lg:hidden">
          {nav.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] text-slate-500", active && "bg-slate-950 text-white")}>
                <Icon className="h-4 w-4" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
