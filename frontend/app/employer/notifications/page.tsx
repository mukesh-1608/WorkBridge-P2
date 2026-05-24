"use client";

import { PageHeader } from "@/components/layout/page-header";
import { NotificationList } from "@/components/notifications/notification-list";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployerActions, useNotifications } from "@/lib/hooks";

export default function EmployerNotificationsPage() {
  const notifications = useNotifications();
  const actions = useEmployerActions();
  return (
    <>
      <PageHeader eyebrow="Notifications" title="Notification center" description="Hiring updates and request activity will collect here." />
      {notifications.isLoading ? <Skeleton className="h-56" /> : (
        <NotificationList
          notifications={notifications.data ?? []}
          onRead={(id) => actions.markRead.mutate(id)}
          onReadAll={() => actions.markAllRead.mutate()}
          pending={actions.markRead.isPending || actions.markAllRead.isPending}
        />
      )}
    </>
  );
}
