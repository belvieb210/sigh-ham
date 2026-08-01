"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface PropsFournisseurRequetes {
  children: React.ReactNode;
}

/** Fournisseur React Query pour les requêtes API futures */
export function FournisseurRequetes({ children }: PropsFournisseurRequetes) {
  const [clientRequetes] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={clientRequetes}>
      {children}
    </QueryClientProvider>
  );
}
