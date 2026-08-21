import "server-only";

import { prisma } from "@/lib/prisma";
import { resoudreAgePatient } from "@/features/caisse/utils-format";
import {
  cheminRecuPublic,
  creerTokenRecuFacture,
} from "@/lib/caisse/token-recu-public";
import { obtenirOriginePublique } from "@/lib/url-publique";
import type { EtiquetteResultatsLabo } from "@/lib/laboratoire/types-etiquette-resultats";
import { estNumeroFacturePharmacie } from "@/lib/caisse/etat-facturation-dual";

export type { EtiquetteResultatsLabo };

function formaterNomPrescripteur(prenom: string, nom: string): string {
  const complet = `${prenom} ${nom}`.trim();
  if (!complet) return "—";
  return complet.replace(/^dr\.?\s+/i, "").trim() || "—";
}

/**
 * Données pour étiquette QR des résultats (examens disponibles).
 * Date = date d'enregistrement des résultats (resultatLe).
 * QR → page publique reçu facture (/r/…) avec infos facture + examens.
 */
export async function construireEtiquetteResultatsDossier(
  dossierId: string,
  examenIds?: string[],
  request?: Request
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
      factures: {
        where: { statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          numeroFacture: true,
          ventePharmacie: { select: { id: true } },
        },
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
    dossier.enregistrementsReception[0]?.medecinResponsable
      ?.trim()
      .replace(/^dr\.?\s+/i, "")
      .trim() || null;
  const medecinDemandeur =
    medecinDepuisPrescripteur || medecinEnreg || "—";
  const cnomMedecin =
    prescripteur?.medecinExterne?.numeroOrdre?.trim() || null;

  const numeroPermanent = patient.numeroPatient;

  const facture =
    dossier.factures.find(
      (f) => !f.ventePharmacie && !estNumeroFacturePharmacie(f.numeroFacture)
    ) ?? dossier.factures[0] ?? null;

  const origin = obtenirOriginePublique(request);
  const urlPublique = facture
    ? `${origin}${cheminRecuPublic(creerTokenRecuFacture(facture.id))}`
    : `${origin}/resultats`;

  return {
    dateResultat,
    nomComplet: `${patient.nom} ${patient.prenom}`.trim().toUpperCase(),
    ligneIdentite,
    numeroPermanent,
    medecinDemandeur,
    cnomMedecin,
    codeBarre: urlPublique,
    urlPublique,
    factureId: facture?.id ?? null,
    numeroFacture: facture?.numeroFacture ?? null,
  };
}
