"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StatutPresence } from "@/generated/prisma/enums";

interface PresenceUtilisateur {
  utilisateurId: string;
  statut: StatutPresence;
}

export function usePresenceMessagerie(participantIds: string[]) {
  const [presences, setPresences] = useState<Map<string, StatutPresence>>(new Map());

  const idsCles = useMemo(
    () => [...new Set(participantIds.filter(Boolean))].sort().join(","),
    [participantIds]
  );

  const charger = useCallback(async () => {
    if (!idsCles) return;
    try {
      const res = await fetch(`/api/messagerie/presence?ids=${encodeURIComponent(idsCles)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { presences: PresenceUtilisateur[] };
      const map = new Map<string, StatutPresence>();
      for (const p of data.presences) {
        map.set(p.utilisateurId, p.statut);
      }
      setPresences(map);
    } catch {
      /* silencieux */
    }
  }, [idsCles]);

  useEffect(() => {
    void charger();
    const interval = setInterval(() => void charger(), 30_000);
    return () => clearInterval(interval);
  }, [charger]);

  const estEnLigne = useCallback(
    (id: string) => presences.get(id) === "EN_LIGNE",
    [presences]
  );

  const nbEnLigne = useMemo(
    () => participantIds.filter((id) => presences.get(id) === "EN_LIGNE").length,
    [participantIds, presences]
  );

  return { estEnLigne, nbEnLigne, presences };
}
