"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, NotebookPen } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type { NoteMedicaleResume } from "@/lib/medecins/types";

interface Props {
  utilisateur: UtilisateurMedecins;
}

export function ContenuNotesMedecins({ utilisateur }: Props) {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const filtreDossier = searchParams.get("dossier");
  const [notes, setNotes] = useState<NoteMedicaleResume[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/medecins/notes");
      const data = (await res.json()) as {
        notes?: NoteMedicaleResume[];
        erreur?: string;
      };
      if (!res.ok || !data.notes) {
        setErreur(data.erreur ?? t("medecins.notes.erreur"));
        return;
      }
      setNotes(data.notes);
    } catch {
      setErreur(t("medecins.notes.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const filtrées = useMemo(() => {
    if (!filtreDossier) return notes;
    return notes.filter((n) => n.dossierId === filtreDossier);
  }, [notes, filtreDossier]);

  const formater = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language || "fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.notes.titre")}
      sousTitre={t("medecins.notes.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.notes.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : filtrées.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-8 text-center text-sm text-texte-secondaire">
            {t("medecins.notes.vide")}
          </p>
        ) : (
          <ul className="space-y-2">
            {filtrées.map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-bleu-medical" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium text-texte-principal">
                        {n.libelle}
                      </p>
                      <span className="text-xs text-texte-secondaire">
                        {formater(n.creeLe)}
                      </span>
                    </div>
                    <p className="text-xs text-texte-secondaire">
                      {n.patient} · {n.typeActe}
                    </p>
                    {n.notes ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-texte-principal">
                        {n.notes}
                      </p>
                    ) : null}
                    <Link
                      href={`/sigh/medecins/consultation?dossier=${encodeURIComponent(n.dossierId)}`}
                      className="mt-2 inline-block text-xs font-medium text-bleu-medical hover:underline"
                    >
                      {t("medecins.nav.consultation")}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MiseEnPageMedecins>
  );
}
