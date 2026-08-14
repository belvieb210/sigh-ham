"use client";

import type { ReactNode } from "react";
import { FournisseurModaleConfirmation } from "@/components/ui/fournisseur-modale-confirmation";

export function FournisseurModaleSigh({ children }: { children: ReactNode }) {
  return <FournisseurModaleConfirmation>{children}</FournisseurModaleConfirmation>;
}
