"use client";

import { useEffect, type ReactNode } from "react";
import { FournisseurModaleConfirmation } from "@/components/ui/fournisseur-modale-confirmation";

export function FournisseurModaleSigh({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const htmlHeight = html.style.height;
    const bodyHeight = body.style.height;
    const bodyMinHeight = body.style.minHeight;
    html.style.height = "100dvh";
    body.style.height = "100dvh";
    body.style.minHeight = "100dvh";
    return () => {
      html.style.height = htmlHeight;
      body.style.height = bodyHeight;
      body.style.minHeight = bodyMinHeight;
    };
  }, []);

  return <FournisseurModaleConfirmation>{children}</FournisseurModaleConfirmation>;
}
