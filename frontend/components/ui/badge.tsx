import { cn } from "@/lib/utils";

export function Badge({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "green" | "amber" | "red" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
        tone === "neutral" && "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80",
        tone === "green" && "border-transparent bg-emerald-100 text-emerald-900 hover:bg-emerald-100/80",
        tone === "amber" && "border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100/80",
        tone === "red" && "border-transparent bg-red-100 text-red-900 hover:bg-red-100/80",
        className
      )}
      {...props}
    />
  );
}
