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
          statut: { notIn: ["ANNULE", "REFUSE"] },
        },
      });
    })(),
  ]);

  const patients: PatientTransfertCaisse[] = file.map((p) => ({
    cleListe: p.fileAttenteId,
    dossierId: p.dossierId,
    numeroPatient: p.numeroPatient,
    numeroDossier: p.numeroDossier,
    nomComplet: `${p.prenom} ${p.nom}`,
    prenom: p.prenom,
    nom: p.nom,
    telephone: p.telephone ?? "—",
    motif: p.motif ?? "—",
    orientation: "Caisse",
    orientationCouleur: COULEURS_ORIENTATION_CAISSE.Caisse ?? "bg-rose-100 text-rose-700",
    codeSalleDestination: "CAISSE",
    statut: p.factureOuverte ? "En cours" : "En attente",
    statutCouleur: p.factureOuverte
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-800",
    heure: formaterHeure(p.arriveeLe),
    arriveeLe: p.arriveeLe,
    transfertId: p.transfertId || null,
    passageId: p.passageId,
    numeroOrdre: p.numeroOrdre,
    nombreExamens: p.nombreExamens,
    montantEstime: p.montantEstime,
    dateNaissance: p.dateNaissance,
    factureOuverte: p.factureOuverte,
    provenance: p.provenance,
    medecinResponsable: p.medecinResponsable,
  }));

  const stats: StatsTransfertsCaisse = {
    enAttente: patients.length,
    enCours: patients.filter((p) => p.factureOuverte).length,
    transferesAujourdhui: transferesDepuisCaisse,
    versLaboratoire: 0,
  };

  return { patients, stats };
}
