import { AppShell } from "@/components/layout/app-shell";
import { AuthGate } from "@/components/layout/auth-gate";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate role="WORKER">
      <AppShell role="WORKER">{children}</AppShell>
    </AuthGate>
  );
}
