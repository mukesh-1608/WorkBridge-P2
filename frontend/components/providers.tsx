"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { ToastViewport, useToast } from "@/components/ui/toast";
import type { SocketPhonePayload } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function RealtimeBridge() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const push = useToast((state) => state.push);

  useEffect(() => {
    if (!token || !user) return;

    const socket: Socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    const refreshWorkerData = () => {
      queryClient.invalidateQueries({ queryKey: ["worker"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("phone_request.approved", (payload: SocketPhonePayload) => {
      push({
        tone: "success",
        title: "Phone request approved",
        description: `${payload.employerName} unlocked their phone number for ${payload.jobTitle}.`
      });
      refreshWorkerData();
    });

    socket.on("phone_request.rejected", (payload: SocketPhonePayload) => {
      push({
        tone: "default",
        title: "Phone request updated",
        description: `${payload.employerName} responded to your request for ${payload.jobTitle}.`
      });
      refreshWorkerData();
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, push, token, user]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 20_000,
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  }));

  return (
    <QueryClientProvider client={client}>
      {children}
      <RealtimeBridge />
      <ToastViewport />
    </QueryClientProvider>
  );
}
