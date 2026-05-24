"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { create } from "zustand";
import { cn } from "@/lib/utils";

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "error";
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
};

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [{ id, ...toast }, ...state.toasts].slice(0, 4) }));
    window.setTimeout(() => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })), 4500);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
}));

export function ToastViewport() {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toast.tone === "error" ? XCircle : toast.tone === "success" ? CheckCircle2 : Info;
          return (
            <motion.button
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              onClick={() => remove(toast.id)}
              className={cn(
                "rounded-2xl border border-white/70 bg-white/88 p-4 text-left shadow-glass backdrop-blur-xl",
                toast.tone === "success" && "border-emerald-100",
                toast.tone === "error" && "border-red-100"
              )}
            >
              <div className="flex gap-3">
                <Icon className={cn("mt-0.5 h-4 w-4 text-slate-500", toast.tone === "success" && "text-emerald-600", toast.tone === "error" && "text-red-600")} />
                <div>
                  <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-sm leading-5 text-slate-600">{toast.description}</p> : null}
                </div>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
