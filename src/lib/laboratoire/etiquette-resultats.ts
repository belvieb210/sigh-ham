import "server-only";

import { prisma } from "@/lib/prisma";
import { resoudreAgePatient } from "@/features/caisse/utils-format";
import type { EtiquetteResultatsLabo } from "@/lib/laboratoire/types-etiquette-resultats";

export type { EtiquetteResultatsLabo };

function formaterNomPrescripteur(prenom: string, nom: string): string {
  const complet = `${prenom} ${nom}`.trim();
  if (!complet) return "—";
  return /^dr\.?\s/i.test(complet) ? complet : `Dr ${complet}`;
}

/**
 * Données pour étiquette code-barres des résultats (examens disponibles).
 * Date = date d'enregistrement des résultats (resultatLe).
 */
export async function construireEtiquetteResultatsDossier(
  dossierId: string,
  examenIds?: string[]
): Promise<EtiquetteResultatsLabo | null> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      patient: true,
      enregistrementsReception: {
        orderBy: { enregistreLe: "desc" },
        take: 1,
        select: { medecinResponsable: true },
      },
      examensLaboratoire: {
        where:
          examenIds && examenIds.length > 0
            ? { id: { in: examenIds } }
            : { statut: { not: "ANNULE" } },
        include: {
          prescripteur: { include: { medecinExterne: true } },
        },
        orderBy: { resultatLe: "desc" },
      },
    },
  });

  if (!dossier) return null;

  const patient = dossier.patient;
  const examens = dossier.examensLaboratoire;
  const dateRef =
    examens.find((e) => e.resultatLe)?.resultatLe ??
    examens[0]?.updatedAt ??
    new Date();

  const dateResultat = dateRef.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const age = resoudreAgePatient({
    dateNaissance: patient.dateNaissance,
    age: patient.age,
  });
  const sexe =
    patient.sexe === "FEMININ"
      ? "F"
      : patient.sexe === "MASCULIN"
        ? "M"
        : patient.sexe?.trim() || "—";
  const tel = (patient.telephone || "").trim() || "—";
  const ligneIdentite = [
    age != null ? `${age} ans` : "—",
    sexe,
    tel,
  ].join(" / ");

  const premierAvecPrescripteur = examens.find((e) => e.prescripteur);
  const prescripteur = premierAvecPrescripteur?.prescripteur;
  const medecinDepuisPrescripteur = prescripteur
    ? formaterNomPrescripteur(prescripteur.prenom, prescripteur.nom)
    : null;
  const medecinEnreg =
    dossier.enregistrementsReception[0]?.medecinResponsable?.trim() || null;
  const medecinDemandeur =
    medecinDepuisPrescripteur || medecinEnreg || "—";
  const cnomMedecin =
    prescripteur?.medecinExterne?.numeroOrdre?.trim() || null;

  const numeroPermanent = patient.numeroPatient;

  return {
    dateResultat,
    nomComplet: `${patient.nom} ${patient.prenom}`.trim().toUpperCase(),
    ligneIdentite,
    numeroPermanent,
    medecinDemandeur,
    cnomMedecin,
    codeBarre: numeroPermanent,
  };
}
