"use client";

import { useEffect, useState } from "react";

export function BadgeMessagerieSidebar({ actif }: { actif: boolean }) {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let annule = false;

    const charger = async () => {
      try {
        const res = await fetch("/api/messagerie/non-lus");
        if (!res.ok) return;
        const data = (await res.json()) as { total: number };
        if (!annule) setTotal(data.total);
      } catch {
        /* silencieux */
      }
    };

    void charger();
    const interval = setInterval(charger, 15000);
    return () => {
      annule = true;
      clearInterval(interval);
    };
  }, []);

  if (total === null || total <= 0) return null;

  return (
    <span
      className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-bleu-medical px-1.5 text-[10px] font-bold text-white ${
        actif ? "bg-white/25" : ""
      }`}
    >
      {total > 99 ? "99+" : total}
    </span>
  );
}
