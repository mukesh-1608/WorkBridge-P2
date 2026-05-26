"use client";

import { motion } from "framer-motion";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{eyebrow}</p> : null}
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">{title}</h2>
        {description ? <p className="mt-2 text-sm text-zinc-600">{description}</p> : null}
      </div>
      {action ? (
        <div>
          {action}
        </div>
      ) : null}
    </motion.div>
  );
}
