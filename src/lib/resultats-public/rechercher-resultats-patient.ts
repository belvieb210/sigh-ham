import "server-only";

import { prisma } from "@/lib/prisma";
import { lireOrientationAnalyseDepuisNotes } from "@/constants/laboratoire-orientations";
import { calculerAge } from "@/features/caisse/utils-format";
import { nomFichierResultatPdf } from "@/lib/laboratoire/pdf-resultats/nom-fichier-resultat-pdf";
import {
  normaliserIdentite,
  normaliserLibelleFacture,
  telephonesCorrespondent,
} from "@/lib/resultats-public/normaliser-identite";
import { creerTokenResultatPublic } from "@/lib/resultats-public/token-resultat-public";
import type { ResultatPatientPublic } from "@/lib/resultats-public/types";

export type { ResultatPatientPublic };

function libellesFactureCorrespondent(
  libelleExamen: string,
  libellesFacture: Set<string>
): boolean {
  if (libellesFacture.size === 0) return true;
  const ex = normaliserLibelleFacture(libelleExamen);
  for (const lf of libellesFacture) {
    if (ex === lf || ex.includes(lf) || lf.includes(ex)) return true;
  }
  return false;
}

function formaterNomPrescripteur(prenom: string, nom: string): string | null {
  const complet = `${prenom} ${nom}`.trim();
  if (!complet) return null;
  return /^dr\.?\s/i.test(complet) ? complet : `Dr ${complet}`;
}

export async function rechercherResultatsPatientPublic(input: {
  nom: string;
  prenom: string;
  numeroPatient: string;
  numeroFacture: string;
  telephone: string;
}): Promise<ResultatPatientPublic | null> {
  const nom = input.nom.trim();
  const prenom = input.prenom.trim();
  const numeroPatient = input.numeroPatient.trim();
  const numeroFacture = input.numeroFacture.trim();
  const telephone = input.telephone.trim();

  if (!nom || !prenom || !numeroPatient || !numeroFacture || !telephone) {
    return null;
  }

  const facture = await prisma.facture.findUnique({
    where: { numeroFacture },
    include: {
      lignes: true,
      dossier: {
        include: {
          patient: true,
          examensLaboratoire: {
            include: {
              typeExamen: { select: { libelle: true } },
              resultats: { select: { id: true }, take: 1 },
              prescripteur: {
                include: {
                  medecinExterne: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!facture) return null;
  if (["BROUILLON", "ANNULEE"].includes(facture.statut)) return null;

  const patient = facture.dossier.patient;
  if (patient.numeroPatient.trim() !== numeroPatient) return null;
  if (normaliserIdentite(patient.nom) !== normaliserIdentite(nom)) return null;
  if (normaliserIdentite(patient.prenom) !== normaliserIdentite(prenom)) {
    return null;
  }
  if (!telephonesCorrespondent(telephone, patient.telephone)) {
    return null;
  }

  const libellesFacture = new Set(
    facture.lignes.map((l) => normaliserLibelleFacture(l.libelle))
  );

  const examensBruts = facture.dossier.examensLaboratoire.map((ex) => ({
    id: ex.id,
    statut: ex.statut,
    libelle: ex.typeExamen.libelle,
    notes: ex.notes,
    resultatLe: ex.resultatLe,
    prescripteur: ex.prescripteur,
    aResultats: ex.resultats.length > 0,
  }));

  const examensEligibles = examensBruts.filter((ex) => {
    if (ex.statut !== "TERMINE") return false;
    if (lireOrientationAnalyseDepuisNotes(ex.notes) !== "DR_APPROUVE") {
      return false;
    }
    if (!ex.aResultats) return false;
    return libellesFactureCorrespondent(ex.libelle, libellesFacture);
  });

  if (examensEligibles.length === 0) return null;

  const examIds = examensEligibles.map((ex) => ex.id);
  const token = creerTokenResultatPublic({
    factureId: facture.id,
    dossierId: facture.dossierId,
    examIds,
  });

  const premierPrescripteur = examensEligibles.find((ex) => ex.prescripteur)
    ?.prescripteur;
  const prescripteur = premierPrescripteur
    ? formaterNomPrescripteur(
        premierPrescripteur.prenom,
        premierPrescripteur.nom
      )
    : null;

  const datesResultat = examensEligibles
    .map((ex) => ex.resultatLe)
    .filter((d): d is Date => d instanceof Date);
  const dateAnalyse =
    datesResultat.length > 0
      ? new Date(
          Math.max(...datesResultat.map((d) => d.getTime()))
        ).toISOString()
      : null;

  const adresseParts = [
    patient.adresse,
    patient.ville,
    patient.province,
    patient.pays,
  ].filter(Boolean);

  return {
    token,
    nomFichier: nomFichierResultatPdf({
      numeroPatient: patient.numeroPatient,
      nbExamens: examIds.length,
      libelleExamen:
        examIds.length === 1 ? examensEligibles[0]!.libelle : undefined,
    }),
    patient: {
      nom: patient.nom,
      prenom: patient.prenom,
      numeroPatient: patient.numeroPatient,
      sexe: patient.sexe,
      age: patient.dateNaissance
        ? calculerAge(patient.dateNaissance.toISOString())
        : null,
      telephone: patient.telephone,
      adresse: adresseParts.length > 0 ? adresseParts.join(", ") : null,
    },
    facture: {
      numeroFacture: facture.numeroFacture,
      statut: facture.statut,
      montantTotal: Number(facture.montantTotal),
      devise: facture.devise,
      emiseLe: facture.emiseLe?.toISOString() ?? null,
    },
    examens: examensEligibles.map((ex) => ({
      id: ex.id,
      libelle: ex.libelle,
      resultatLe: ex.resultatLe?.toISOString() ?? null,
    })),
    prescripteur,
    dateAnalyse,
  };
}
