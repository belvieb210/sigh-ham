import "server-only";
import { mappingTubeDepuisCategorie } from "@/constants/laboratoire-tubes";
import type { EtiquetteTubeLabo } from "@/lib/caisse/types";
import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";

export type { EtiquetteTubeLabo };

function decimalSafeAge(dateNaissance: Date | null): number | null {
  return calculerAge(dateNaissance?.toISOString() ?? null);
}

/** Construit les étiquettes (1 par type de tube / département) pour une facture approuvée. */
export async function construireEtiquettesFacture(
  factureId: string
): Promise<{
  facture: { id: string; numeroFacture: string; approuvee: boolean };
  etiquettes: EtiquetteTubeLabo[];
} | null> {
  const facture = await prisma.facture.findUnique({
    where: { id: factureId },
    include: {
      dossier: {
        include: {
          patient: true,
          examensLaboratoire: {
            where: { statut: { not: "ANNULE" } },
            include: { typeExamen: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!facture) return null;

  const patient = facture.dossier.patient;
  const age = decimalSafeAge(patient.dateNaissance);
  const sexeCode =
    patient.sexe === "FEMININ" ? "F" : patient.sexe === "MASCULIN" ? "M" : "X";
  const tel = (patient.telephone || "").replace(/\s+/g, "") || "—";
  const nomPatient = `${patient.nom} ${patient.prenom}`.trim().toUpperCase();
  const idEchantillon = facture.dossier.numeroDossier.replace(/\D/g, "") || facture.numeroFacture.replace(/\D/g, "");

  const maintenant = facture.approuveeLe ?? new Date();
  const dateStr = maintenant.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const heureStr = maintenant.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const groupes = new Map<
    string,
    ReturnType<typeof mappingTubeDepuisCategorie>
  >();

  const examens = facture.dossier.examensLaboratoire;
  if (examens.length === 0) {
    const m = mappingTubeDepuisCategorie("Biochimie");
    groupes.set(m.departement, m);
  } else {
    for (const ex of examens) {
      const m = mappingTubeDepuisCategorie(ex.typeExamen.categorie);
      groupes.set(m.departement, m);
    }
  }

  if (groupes.size === 0) {
    const m = mappingTubeDepuisCategorie("Biochimie");
    groupes.set(m.departement, m);
  }

  const etiquettes: EtiquetteTubeLabo[] = [...groupes.values()].map((m) => {
    const codeBarre = `${idEchantillon}${m.codeDepartement}`.slice(0, 22);
    return {
      codeBarre,
      ligneDateTube: `${dateStr}/${heureStr}/${m.typeTube}`,
      nomPatient,
      ligneIdentite: `B/${age ?? "—"}/Y/${sexeCode}/${tel}`,
      ligneDepartement: `${m.departement} - ${idEchantillon}`,
      typeTube: m.typeTube,
      departement: m.departement,
    };
  });

  return {
    facture: {
      id: facture.id,
      numeroFacture: facture.numeroFacture,
      approuvee: Boolean(facture.approuveeLe),
    },
    etiquettes,
  };
}

export async function approuverFactureCaisse(
  factureId: string,
  agentId: string
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  const facture = await prisma.facture.findUnique({ where: { id: factureId } });
  if (!facture) return { ok: false, erreur: "Facture introuvable." };
  if (facture.statut === "ANNULEE" || facture.statut === "BROUILLON") {
    return { ok: false, erreur: "Cette facture ne peut pas être approuvée." };
  }
  if (Number(facture.montantPaye) <= 0 && facture.statut !== "PAYEE") {
    return { ok: false, erreur: "Aucun paiement enregistré sur cette facture." };
  }
  if (facture.approuveeLe) {
    return { ok: true };
  }

  await prisma.facture.update({
    where: { id: factureId },
    data: {
      approuveeLe: new Date(),
      approuveeParId: agentId,
    },
  });

  return { ok: true };
}
