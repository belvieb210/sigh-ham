"use client";

import { useQuery } from "@tanstack/react-query";
import type { ExamenPublic } from "@/lib/client/charger-examens-public";

export function useExamensPublic() {
  return useQuery({
    queryKey: ["public", "examens"],
    queryFn: async () => {
      const res = await fetch("/api/public/examens");
      if (!res.ok) throw new Error("Impossible de charger les examens");
      const data = (await res.json()) as { examens?: ExamenPublic[] };
      return data.examens ?? [];
    },
    staleTime: 60_000,
  });
}
