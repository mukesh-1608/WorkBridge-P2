"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import type { NotificationItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function NotificationList({ notifications, onRead, onReadAll, pending }: { notifications: NotificationItem[]; onRead: (id: string) => void; onReadAll: () => void; pending?: boolean }) {
  if (!notifications.length) {
    return <EmptyState icon={Bell} title="No notifications yet" description="Important hiring and phone-request updates will appear here." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onReadAll} disabled={pending}>
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>
      {notifications.map((item) => (
        <Card key={item.id} className={item.readAt ? "opacity-75" : "ring-1 ring-slate-950/5"}>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
              <p className="mt-2 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
            </div>
            {!item.readAt ? (
              <Button variant="ghost" onClick={() => onRead(item.id)} disabled={pending}>
                Mark read
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
