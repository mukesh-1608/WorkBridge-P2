import { AppShell } from "@/components/layout/app-shell";
import { AuthGate } from "@/components/layout/auth-gate";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate role="EMPLOYER">
      <AppShell role="EMPLOYER">{children}</AppShell>
    </AuthGate>
  );
}
