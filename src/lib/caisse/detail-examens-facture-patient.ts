import "server-only";
import { prisma } from "@/lib/prisma";
import { classerExamensFacture } from "@/lib/laboratoire/classer-examens-facture";

export async function obtenirDetailExamensFacturePatient(dossierId: string) {
  const facture = await prisma.facture.findFirst({
    where: {
      dossierId,
      statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
    },
    include: {
      lignes: true,
      dossier: {
        include: {
          examensLaboratoire: {
            where: { statut: { not: "ANNULE" } },
            include: {
              typeExamen: { select: { libelle: true } },
              resultats: { select: { id: true }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!facture) {
    return null;
  }

  const examensBruts = facture.dossier.examensLaboratoire.map((ex) => ({
    id: ex.id,
    statut: ex.statut,
    libelle: ex.typeExamen.libelle,
    notes: ex.notes,
    resultatLe: ex.resultatLe,
    aResultats: ex.resultats.length > 0,
  }));

  const { approuves, enAttente } = classerExamensFacture(
    facture.lignes.map((l) => ({
      libelle: l.libelle,
      montant: Number(l.montant),
    })),
    examensBruts
  );

  return {
    numeroFacture: facture.numeroFacture,
    statutFacture: facture.statut,
    examensDisponibles: approuves,
    examensEnAttente: enAttente,
  };
}
