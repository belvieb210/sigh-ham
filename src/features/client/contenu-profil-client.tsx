"use client";

import { ContenuProfilUtilisateur } from "@/features/reception/contenu-profil-utilisateur";
import type { UtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export function ContenuProfilClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  return (
    <ContenuProfilUtilisateur utilisateur={utilisateur} salle="client" />
  );
}
