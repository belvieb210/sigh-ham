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
      <div className="flex h-[100dvh] min-w-0 flex-col overflow-y-hidden bg-[#f1f5f9]">
        {children}
      </div>
    </FournisseurModaleSigh>
  );
}
