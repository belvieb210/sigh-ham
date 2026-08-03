import "server-only";
import { mappingTubeDepuisCategorie } from "@/constants/laboratoire-tubes";
import type { EtiquetteTubeLabo } from "@/lib/caisse/types";
import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";

export type { EtiquetteTubeLabo };

function agePatient(dateNaissance: Date | null): number | null {
  return calculerAge(dateNaissance?.toISOString() ?? null);
}

/**
 * Une étiquette par spécimen distinct (EDTA-SANG, SEC-SERUM, ECBU-URINES…).
 * Le département (HEMATOLOGIE, BIOCHIMIE…) est le type d'examen / service.
 */
export async function construireEtiquettesFacture(
  factureId: string
): Promise<{
  facture: { id: string; numeroFacture: string; approuvee: boolean };
  etiquettes: EtiquetteTubeLabo[];
} | null> {
  const facture = await prisma.facture.findUnique({
    where: { id: factureId },
    include: {
      lignes: { where: { montant: { gt: 0 } }, orderBy: { id: "asc" } },
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
  const age = agePatient(patient.dateNaissance);
  const sexeCode =
    patient.sexe === "FEMININ" ? "F" : patient.sexe === "MASCULIN" ? "M" : "X";
  const tel = (patient.telephone || "").replace(/\s+/g, "") || "—";
  const nomPatient = `${patient.nom} ${patient.prenom}`.trim().toUpperCase();
  const idEchantillon =
    facture.dossier.numeroDossier.replace(/\D/g, "") ||
    facture.numeroFacture.replace(/\D/g, "");

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

  /** Clé = spécimen (typeTube) → 1 barcode par specimen différent */
  const parSpecimen = new Map<
    string,
    ReturnType<typeof mappingTubeDepuisCategorie>
  >();

  const examens = facture.dossier.examensLaboratoire;

  if (examens.length > 0) {
    for (const ex of examens) {
      const m = mappingTubeDepuisCategorie(ex.typeExamen.categorie);
      parSpecimen.set(m.typeTube, m);
    }
  } else {
    // Relier les lignes de facture aux types d'examen (libellé)
    const libelles = facture.lignes.map((l) => l.libelle.trim()).filter(Boolean);
    if (libelles.length > 0) {
      const types = await prisma.typeExamen.findMany({
        where: {
          OR: libelles.map((libelle) => ({
            libelle: { equals: libelle, mode: "insensitive" as const },
          })),
        },
        select: { libelle: true, categorie: true },
      });
      for (const type of types) {
        const m = mappingTubeDepuisCategorie(type.categorie);
        parSpecimen.set(m.typeTube, m);
      }
      // Lignes sans correspondance exacte : tenter contains
      if (parSpecimen.size === 0) {
        const tous = await prisma.typeExamen.findMany({
          where: { actif: true },
          select: { libelle: true, categorie: true },
        });
        for (const libelle of libelles) {
          const trouve = tous.find(
            (t) =>
              t.libelle.toLowerCase() === libelle.toLowerCase() ||
              libelle.toLowerCase().includes(t.libelle.toLowerCase()) ||
              t.libelle.toLowerCase().includes(libelle.toLowerCase())
          );
          if (trouve) {
            const m = mappingTubeDepuisCategorie(trouve.categorie);
            parSpecimen.set(m.typeTube, m);
          }
        }
      }
    }
  }

  if (parSpecimen.size === 0) {
    const m = mappingTubeDepuisCategorie("Biochimie");
    parSpecimen.set(m.typeTube, m);
  }

  // Ordre stable : EDTA → SERUM → URINES puis autres
  const ordre = ["EDTA-SANG", "SEC-SERUM", "ECBU-URINES"];
  const liste = [...parSpecimen.values()].sort((a, b) => {
    const ia = ordre.indexOf(a.typeTube);
    const ib = ordre.indexOf(b.typeTube);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const etiquettes: EtiquetteTubeLabo[] = liste.map((m) => {
    const codeBarre = `${idEchantillon}${m.codeDepartement}`.slice(0, 22);
    return {
      codeBarre,
      // Specimen (tube) en fin de ligne date
      ligneDateTube: `${dateStr}/${heureStr}/${m.typeTube}`,
      nomPatient,
      ligneIdentite: `B/${age ?? "—"}/Y/${sexeCode}/${tel}`,
      // Type d'examen / service labo
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
