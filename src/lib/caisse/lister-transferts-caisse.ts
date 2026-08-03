import "server-only";
import { COULEURS_ORIENTATION_CAISSE } from "@/constants/caisse";
import { listerPatientsEnAttenteCaisse } from "@/lib/caisse/lister-patients-caisse";
import { prisma } from "@/lib/prisma";
import type { PatientTransfertCaisse, StatsTransfertsCaisse } from "@/lib/caisse/types";

function formaterHeure(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function raccourcirOrientation(nom: string): string {
  if (nom.startsWith("Médecin")) return nom.includes("externe") ? "Médecin externe" : "Médecin";
  if (nom.startsWith("Infirmier")) return "Infirmiers";
  if (nom.startsWith("Laboratoire")) return "Laboratoire";
  if (nom.startsWith("Pharmacie")) return "Pharmacie";
  if (nom.startsWith("Église")) return "Église";
  if (nom.startsWith("Caisse")) return "Caisse";
  return nom;
}

function libelleStatutLigne(opts: {
  factureOuverte: boolean;
  statutTransfert: string | null;
  enRecuperation: boolean;
}): { statut: string; statutCouleur: string } {
  if (opts.enRecuperation && opts.statutTransfert === "REFUSE") {
    return { statut: "Rejeté", statutCouleur: "bg-red-100 text-red-700" };
  }
  if (opts.statutTransfert === "EN_ATTENTE") {
    return { statut: "À confirmer", statutCouleur: "bg-orange-100 text-orange-800" };
  }
  if (opts.factureOuverte) {
    return { statut: "En cours", statutCouleur: "bg-blue-100 text-blue-700" };
  }
  return { statut: "En attente", statutCouleur: "bg-amber-100 text-amber-800" };
}

export async function listerPatientsTransfertsCaisse(): Promise<{
  patients: PatientTransfertCaisse[];
  stats: StatsTransfertsCaisse;
}> {
  const [file, transferesDepuisCaisse] = await Promise.all([
    listerPatientsEnAttenteCaisse(),
    (async () => {
      const debut = new Date();
      debut.setHours(0, 0, 0, 0);
      return prisma.transfert.count({
        where: {
          salleOrigine: { code: "CAISSE" },
          emisLe: { gte: debut },
          statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
        },
      });
    })(),
  ]);

  const dossierIds = file.map((p) => p.dossierId);
  const transfertsSortants =
    dossierIds.length === 0
      ? []
      : await prisma.transfert.findMany({
          where: {
            dossierId: { in: dossierIds },
            salleOrigine: { code: "CAISSE" },
            OR: [
              { statut: "EN_ATTENTE" },
              {
                statut: "REFUSE",
                recuperation: { statut: "EN_RECUPERATION" },
              },
            ],
          },
          include: {
            salleDestination: { select: { code: true, nom: true } },
            recuperation: { select: { statut: true } },
          },
          orderBy: { emisLe: "desc" },
        });

  const sortantParDossier = new Map<string, (typeof transfertsSortants)[number]>();
  for (const t of transfertsSortants) {
    if (!sortantParDossier.has(t.dossierId)) {
      sortantParDossier.set(t.dossierId, t);
    }
  }

  const patients: PatientTransfertCaisse[] = file.map((p) => {
    const sortant = sortantParDossier.get(p.dossierId);
    const enRecuperation = sortant?.recuperation?.statut === "EN_RECUPERATION";
    const orientation = sortant
      ? raccourcirOrientation(sortant.salleDestination.nom)
      : "Caisse";
    const { statut, statutCouleur } = libelleStatutLigne({
      factureOuverte: p.factureOuverte,
      statutTransfert: sortant?.statut ?? null,
      enRecuperation,
    });

    return {
      cleListe: p.fileAttenteId,
      dossierId: p.dossierId,
      numeroPatient: p.numeroPatient,
      numeroDossier: p.numeroDossier,
      nomComplet: `${p.prenom} ${p.nom}`,
      prenom: p.prenom,
      nom: p.nom,
      telephone: p.telephone ?? "—",
      motif: p.motif ?? "—",
      orientation,
      orientationCouleur:
        COULEURS_ORIENTATION_CAISSE[orientation] ?? "bg-slate-100 text-slate-600",
      codeSalleDestination: sortant?.salleDestination.code ?? "CAISSE",
      statut,
      statutCouleur,
      heure: formaterHeure(p.arriveeLe),
      arriveeLe: p.arriveeLe,
      transfertId: p.transfertId || null,
      transfertSortantId: sortant?.id ?? null,
      statutTransfertSortant: sortant?.statut ?? null,
      enRecuperation,
      passageId: p.passageId,
      numeroOrdre: p.numeroOrdre,
      nombreExamens: p.nombreExamens,
      montantEstime: p.montantEstime,
      dateNaissance: p.dateNaissance,
      factureOuverte: p.factureOuverte,
      provenance: p.provenance,
      medecinResponsable: p.medecinResponsable,
    };
  });

  const stats: StatsTransfertsCaisse = {
    enAttente: patients.filter((p) => !p.factureOuverte && !p.transfertSortantId).length,
    enCours: patients.filter((p) => p.factureOuverte || p.statutTransfertSortant === "EN_ATTENTE")
      .length,
    transferesAujourdhui: transferesDepuisCaisse,
    versLaboratoire: patients.filter((p) => p.orientation === "Laboratoire").length,
  };

  return { patients, stats };
}
