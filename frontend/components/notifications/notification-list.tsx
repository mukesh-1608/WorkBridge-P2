"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import type { NotificationItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function NotificationList({ notifications, onRead, onReadAll, pending, onApprovePhone, onRejectPhone }: { notifications: NotificationItem[]; onRead: (id: string) => void; onReadAll: () => void; pending?: boolean; onApprovePhone?: (applicationId: string) => void; onRejectPhone?: (applicationId: string) => void; }) {
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
            <div className="flex flex-col items-end gap-2">
              {!item.readAt ? (
                <Button variant="ghost" onClick={() => onRead(item.id)} disabled={pending}>
                  Mark read
                </Button>
              ) : null}
              {item.type === "PHONE_REQUEST_CREATED" && onApprovePhone && onRejectPhone && item.metadata?.applicationId && !item.readAt ? (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onRejectPhone(item.metadata.applicationId as string)} disabled={pending}>Reject</Button>
                  <Button size="sm" onClick={() => onApprovePhone(item.metadata.applicationId as string)} disabled={pending}>Approve</Button>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
