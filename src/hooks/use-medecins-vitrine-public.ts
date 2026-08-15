"use client";

import { useQuery } from "@tanstack/react-query";
import type { MedecinVitrinePublic } from "@/lib/client/contenu-public";

export function useMedecinsVitrinePublic() {
  return useQuery({
    queryKey: ["public", "medecins-vitrine", "rdv"],
    queryFn: async () => {
      const res = await fetch("/api/public/medecins-vitrine");
      if (!res.ok) throw new Error("Impossible de charger les médecins");
      const data = (await res.json()) as { medecins?: MedecinVitrinePublic[] };
      return (data.medecins ?? []).filter(
        (m) =>
          m.categorie !== "SERVICE_EGLISE" && m.categorie !== "MEDECIN_EXTERNE"
      );
    },
    staleTime: 60_000,
  });
}
