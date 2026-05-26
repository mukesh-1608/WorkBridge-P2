"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BriefcaseBusiness, ClipboardList, Home, LogOut, Plus, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useNotifications } from "@/lib/hooks";

const workerNav = [
  { href: "/worker/dashboard", label: "Dashboard", icon: Home },
  { href: "/worker/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/worker/applications", label: "Applications", icon: ClipboardList },
  { href: "/worker/notifications", label: "Notifications", icon: Bell }
];

const employerNav = [
  { href: "/employer/dashboard", label: "Dashboard", icon: Home },
  { href: "/employer/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/employer/jobs/new", label: "New Job", icon: Plus },
  { href: "/employer/notifications", label: "Notifications", icon: Bell }
];

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const nav = role === "WORKER" ? workerNav : employerNav;
  const notifications = useNotifications();
  const unreadCount = notifications.data?.filter(n => !n.readAt).length ?? 0;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white px-3 py-4 lg:block">
        <Link href={role === "WORKER" ? "/worker/dashboard" : "/employer/dashboard"} className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-950 text-sm font-semibold text-white">JW</div>
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
                  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900",
                  active && "bg-zinc-100 text-zinc-900"
                )}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{role.toLowerCase()} portal</p>
              <h1 className="truncate text-sm font-semibold text-zinc-900">{user?.name ?? "Welcome"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 sm:flex">
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
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-zinc-200 bg-white lg:hidden">
          {nav.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 px-2 py-3 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900", active && "text-zinc-900")}>
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
