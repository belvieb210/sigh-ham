"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Loader2, PenLine } from "lucide-react";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import { examensPourPageStatut } from "@/features/laboratoire/utils-affichage";
import { formaterParametre } from "@/features/laboratoire/utils-saisie-resultats";
import type {
  ExamenSaisieDto,
  ParametreSaisieDto,
  SaisieResultatsDto,
} from "@/lib/laboratoire/saisie-resultats-types";
import { cheminSaisieResultats } from "@/lib/laboratoire/saisie-resultats-types";
import { cn } from "@/lib/utils";
import Link from "next/link";

function compterParametres(parametres: ParametreSaisieDto[]) {
  const total = parametres.length;
  const renseignes = parametres.filter(
    (p) => p.nonRequis || p.valeur.trim().length > 0
  ).length;
  return { total, renseignes, vides: total - renseignes };
}

function ListeParametresExamen({ parametres }: { parametres: ParametreSaisieDto[] }) {
  const { t } = useTranslation();

  if (parametres.length === 0) {
    return (
      <p className="py-2 text-xs text-texte-secondaire">
        {t("laboratoire.detailExamens.aucunParametre")}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gris-bordure rounded-lg border border-gris-bordure bg-white">
      {parametres.map((p) => {
        const { acronyme, libelle } = formaterParametre(p.nom);
        const vide = !p.nonRequis && !p.valeur.trim();
        return (
          <li
            key={p.id}
            className="flex items-start justify-between gap-2 px-3 py-2 text-xs"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-violet-900">{acronyme}</p>
              {libelle && libelle !== acronyme && (
                <p className="truncate text-[10px] text-texte-secondaire">{libelle}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              {p.nonRequis ? (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  NR
                </span>
              ) : vide ? (
                <span className="text-[11px] italic text-texte-secondaire">—</span>
              ) : (
                <span className="font-medium text-texte-principal">
                  {p.valeur}
                  {p.unite ? (
                    <span className="ml-0.5 text-texte-secondaire">{p.unite}</span>
                  ) : null}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CarteExamenDetail({
  examen,
  dossierId,
  ouvertParDefaut,
}: {
  examen: ExamenSaisieDto;
  dossierId: string;
  ouvertParDefaut: boolean;
}) {
  const { t } = useTranslation();
  const [ouvert, setOuvert] = useState(ouvertParDefaut);
  const stats = compterParametres(examen.parametres);

  return (
    <div className="rounded-lg border border-gris-bordure bg-gris-tres-clair/40">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-start gap-2 px-3 py-2.5 text-left"
      >
        <span className="mt-0.5 shrink-0 text-texte-secondaire">
          {ouvert ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-texte-principal">
            {examen.libelle}
          </span>
          <span className="mt-0.5 block text-[11px] text-texte-secondaire">
            {t("laboratoire.detailExamens.compteurParametres", {
              total: stats.total,
              renseignes: stats.renseignes,
              vides: stats.vides,
            })}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            examen.statut === "EN_ANALYSE"
              ? "bg-amber-50 text-amber-700"
              : examen.statut === "TERMINE"
                ? "bg-teal-50 text-teal-700"
                : examen.statut === "ANNULE"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-100 text-slate-600"
          )}
        >
          {t(`laboratoire.statutExamen.${examen.statut}`)}
        </span>
      </button>
      {ouvert && (
        <div className="space-y-2 border-t border-gris-bordure px-3 pb-3 pt-2">
          <ListeParametresExamen parametres={examen.parametres} />
          <Link
            href={cheminSaisieResultats(dossierId)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-bleu-medical hover:underline"
          >
            <PenLine className="h-3.5 w-3.5" />
            {t("laboratoire.detailExamens.ouvrirSaisie")}
          </Link>
        </div>
      )}
    </div>
  );
}

interface PropsDetailExamensPatientLaboratoire {
  dossierId: string | null;
  statutFiltre: IdOrientationStatutAnalyse;
}

export function DetailExamensPatientLaboratoire({
  dossierId,
  statutFiltre,
}: PropsDetailExamensPatientLaboratoire) {
  const { t } = useTranslation();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [saisie, setSaisie] = useState<SaisieResultatsDto | null>(null);

  const charger = useCallback(async () => {
    if (!dossierId) {
      setSaisie(null);
      return;
    }
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch(
        `/api/laboratoire/dossiers/${encodeURIComponent(dossierId)}/saisie-resultats`
      );
      const data = (await res.json()) as {
        saisie?: SaisieResultatsDto;
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("laboratoire.detailExamens.erreur"));
        setSaisie(null);
        return;
      }
      setSaisie(data.saisie ?? null);
    } catch {
      setErreur(t("laboratoire.detailExamens.erreur"));
      setSaisie(null);
    } finally {
      setChargement(false);
    }
  }, [dossierId, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const examensFiltres = useMemo(() => {
    if (!saisie) return [];
    return examensPourPageStatut(saisie.examens, statutFiltre);
  }, [saisie, statutFiltre]);

  if (!dossierId) {
    return (
      <p className="text-xs text-texte-secondaire">
        {t("laboratoire.detailExamens.selectionnerPatient")}
      </p>
    );
  }

  if (chargement) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-bleu-medical" />
      </div>
    );
  }

  if (erreur) {
    return <p className="text-xs text-rouge-alerte">{erreur}</p>;
  }

  if (examensFiltres.length === 0) {
    return (
      <p className="text-xs text-texte-secondaire">
        {t("laboratoire.detailExamens.aucunExamenStatut", {
          statut: t(`laboratoire.orientationsStatut.${statutFiltre}.label`),
        })}
      </p>
    );
  }

  if (examensFiltres.length === 1) {
    const examen = examensFiltres[0]!;
    const stats = compterParametres(examen.parametres);
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-texte-principal">{examen.libelle}</p>
          <p className="text-[11px] text-texte-secondaire">
            {t("laboratoire.detailExamens.compteurParametres", {
              total: stats.total,
              renseignes: stats.renseignes,
              vides: stats.vides,
            })}
          </p>
        </div>
        <ListeParametresExamen parametres={examen.parametres} />
        <Link
          href={cheminSaisieResultats(dossierId)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-bleu-medical hover:underline"
        >
          <PenLine className="h-3.5 w-3.5" />
          {t("laboratoire.detailExamens.ouvrirSaisie")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-texte-secondaire">
        {t("laboratoire.detailExamens.plusieursExamens", {
          count: examensFiltres.length,
        })}
      </p>
      {examensFiltres.map((ex) => (
        <CarteExamenDetail
          key={ex.id}
          examen={ex}
          dossierId={dossierId}
          ouvertParDefaut={examensFiltres.length <= 3}
        />
      ))}
    </div>
  );
}
