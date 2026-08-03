"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

interface Props {
  utilisateur: { prenom: string; nom: string; role: string; salle: string };
}

export function ContenuNotificationsTransversal({ utilisateur }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f1f5f9]">
      <header className="flex shrink-0 items-center gap-3 border-b border-gris-bordure bg-white px-4 py-3">
        <Link
          href="/sigh/reception"
          className="rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-texte-secondaire">
            SIGH — {utilisateur.salle}
          </p>
          <h1 className="text-lg font-bold text-texte-principal">Notifications</h1>
        </div>
      </header>
      <main className="min-h-0 flex-1 p-3 lg:p-4">
        <InterfaceNotifications />
      </main>
    </div>
  );
}
