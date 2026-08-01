"use client";

import { useNotificationsLive } from "@/features/notifications/hooks/use-notifications-live";

export function BadgeNotificationsSidebar({ actif }: { actif: boolean }) {
  const { totalNonLues, chargement } = useNotificationsLive();

  if (chargement || totalNonLues <= 0) return null;

  return (
    <span
      className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-red-500 px-1.5 text-[10px] font-bold text-white ${
        actif ? "bg-white/25" : ""
      }`}
    >
      {totalNonLues > 99 ? "99+" : totalNonLues}
    </span>
  );
}
