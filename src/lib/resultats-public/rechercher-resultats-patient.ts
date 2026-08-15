import "server-only";

import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";
import { classerExamensFacture } from "@/lib/laboratoire/classer-examens-facture";
import { nomFichierResultatPdf } from "@/lib/laboratoire/pdf-resultats/nom-fichier-resultat-pdf";
import {
  normaliserIdentite,
  telephonesCorrespondent,
} from "@/lib/resultats-public/normaliser-identite";
import { creerTokenResultatPublic } from "@/lib/resultats-public/token-resultat-public";
import type { ReponseRechercheResultatsPublic } from "@/lib/resultats-public/types";

export type {
  ReponseRechercheResultatsPublic,
  ResultatPatientPublic,
  ResultatEnAttentePublic,
} from "@/lib/resultats-public/types";

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
}): Promise<ReponseRechercheResultatsPublic> {
  const nom = input.nom.trim();
  const prenom = input.prenom.trim();
  const numeroPatient = input.numeroPatient.trim();
  const numeroFacture = input.numeroFacture.trim();
  const telephone = input.telephone.trim();

  if (!nom || !prenom || !numeroPatient || !numeroFacture || !telephone) {
    return { type: "introuvable" };
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
              prescripteur: true,
            },
          },
        },
      },
    },
  });

  if (!facture) return { type: "introuvable" };
  if (["BROUILLON", "ANNULEE"].includes(facture.statut)) {
    return { type: "introuvable" };
  }

  const patient = facture.dossier.patient;
  if (patient.numeroPatient.trim() !== numeroPatient) {
    return { type: "introuvable" };
  }
  if (normaliserIdentite(patient.nom) !== normaliserIdentite(nom)) {
    return { type: "introuvable" };
  }
  if (normaliserIdentite(patient.prenom) !== normaliserIdentite(prenom)) {
    return { type: "introuvable" };
  }
  if (!telephonesCorrespondent(telephone, patient.telephone)) {
    return { type: "introuvable" };
  }

  const examensBruts = facture.dossier.examensLaboratoire.map((ex) => ({
    id: ex.id,
    statut: ex.statut,
    libelle: ex.typeExamen.libelle,
    notes: ex.notes,
    resultatLe: ex.resultatLe,
    prescripteur: ex.prescripteur,
    aResultats: ex.resultats.length > 0,
  }));

  const { approuves, enAttente } = classerExamensFacture(
    facture.lignes.map((l) => ({
      libelle: l.libelle,
      montant: Number(l.montant),
    })),
    examensBruts
  );

  const examensEnAttente = enAttente.map((ex) => ({ libelle: ex.libelle }));

  if (approuves.length === 0) {
    if (examensEnAttente.length > 0) {
      return {
        type: "en_attente",
        attente: {
          patient: {
            nom: patient.nom,
            prenom: patient.prenom,
            numeroPatient: patient.numeroPatient,
          },
          facture: { numeroFacture: facture.numeroFacture },
          examensEnAttente,
        },
      };
    }
    return { type: "introuvable" };
  }

  const examIds = approuves.map((ex) => ex.id);
  const token = creerTokenResultatPublic({
    factureId: facture.id,
    dossierId: facture.dossierId,
    examIds,
  });

  const premierPrescripteur = approuves
    .map((ex) => examensBruts.find((b) => b.id === ex.id)?.prescripteur)
    .find(Boolean);
  const prescripteur = premierPrescripteur
    ? formaterNomPrescripteur(
        premierPrescripteur.prenom,
        premierPrescripteur.nom
      )
    : null;

  const datesResultat = approuves
    .map((ex) => examensBruts.find((b) => b.id === ex.id)?.resultatLe)
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
    type: "succes",
    resultat: {
      token,
      nomFichier: nomFichierResultatPdf({
        numeroPatient: patient.numeroPatient,
        nbExamens: examIds.length,
        nom: patient.nom,
        prenom: patient.prenom,
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
      examens: approuves.map((ex) => {
        const brut = examensBruts.find((b) => b.id === ex.id);
        return {
          id: ex.id,
          libelle: ex.libelle,
          resultatLe: brut?.resultatLe?.toISOString() ?? null,
        };
      }),
      examensExclus: examensEnAttente,
      prescripteur,
      dateAnalyse,
    },
  };
}
