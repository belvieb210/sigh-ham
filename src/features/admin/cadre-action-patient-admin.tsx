"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";

export type PatientGouvernance = {
  id: string;
  numeroPatient: string;
  prenom: string;
  nom: string;
  photoUrl: string | null;
  telephone: string | null;
};

export function CadreActionPatientAdmin({
  utilisateur,
  icone,
  titre,
  description,
  fil,
  patient,
  children,
}: {
  utilisateur: UtilisateurAdmin;
  icone: LucideIcon;
  titre: string;
  description: string;
  fil: string;
  patient: PatientGouvernance | null;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={titre}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <Link
          href="/sigh/admin/patients"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-bleu-medical hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin.patients.actions.retour")}
        </Link>

        <EnTetePageReception
          icone={icone}
          titre={titre}
          description={description}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.patients.fil"), href: "/sigh/admin/patients" },
            { label: fil },
          ]}
        />

        {patient ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm">
            <AvatarUtilisateur
              prenom={patient.prenom}
              nom={patient.nom}
              photoUrl={patient.photoUrl}
              taille="md"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-texte-principal">
                {patient.prenom} {patient.nom}
              </p>
              <p className="text-xs text-texte-secondaire">
                {patient.numeroPatient}
                {patient.telephone ? ` · ${patient.telephone}` : ""}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-4">{children}</div>
      </div>
    </MiseEnPageAdmin>
  );
}

export function grouperParJour<T extends { ouvertLe: string }>(items: T[]) {
  const groupes: { jour: string; items: T[] }[] = [];
  const index = new Map<string, T[]>();
  for (const item of items) {
    const jour = item.ouvertLe.slice(0, 10);
    const existant = index.get(jour);
    if (existant) {
      existant.push(item);
    } else {
      const liste = [item];
      index.set(jour, liste);
      groupes.push({ jour, items: liste });
    }
  }
  return groupes;
}

export function formaterJourLong(isoJour: string, locale: string) {
  const date = new Date(`${isoJour}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoJour;
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
