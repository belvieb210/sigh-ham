import type { Metadata } from "next";
import { FournisseurModaleSigh } from "@/components/providers/fournisseur-modale-sigh";

export const metadata: Metadata = {
  title: "SIGH — Espace personnel",
  robots: { index: false, follow: false },
};

export default function LayoutSigh({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <FournisseurModaleSigh>
      <div className="flex h-dvh max-h-dvh min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#f1f5f9]">
        {children}
      </div>
    </FournisseurModaleSigh>
  );
}
