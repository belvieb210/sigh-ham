import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { listerOrdonnancesInbox } from "@/lib/pharmacie/gestion-ordonnances";
import { listerVentes } from "@/lib/pharmacie/gestion-ordonnances";
import {
  listerPatientsPharmacie,
  obtenirStatsPharmacie,
} from "@/lib/pharmacie/lister-patients-pharmacie";
import { rapportStockPharmacie, rapportVentesPharmacie } from "@/lib/pharmacie/rapports";
import type {
  AlertePharmacieDashboard,
  ApercuDashboardPharmacie,
  OrdonnanceDashboardPharmacie,
} from "@/lib/pharmacie/types";
import { prisma } from "@/lib/prisma";

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

function libelleOrdonnance(id: string) {
  return `ORD-${id.slice(-8).toUpperCase()}`;
}

function formaterSexeAge(sexe: string | null, age: number | null) {
  const s =
    sexe === "MASCULIN" ? "M" : sexe === "FEMININ" ? "F" : sexe === "AUTRE" ? "A" : "—";
  if (age != null) return `${age} ans / ${s}`;
  return s !== "—" ? s : "—";
}

export async function obtenirApercuDashboardPharmacie(): Promise<ApercuDashboardPharmacie> {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);

  const [stats, ordonnancesInbox, ventesEnAttente, ventesPayees, rapportVentes, rapportStock] =
    await Promise.all([
      obtenirStatsPharmacie(),
      listerOrdonnancesInbox(),
      listerVentes(["TRANSMISE"]),
      listerVentes(["PAYEE"]),
      rapportVentesPharmacie({ depuis: debut }),
      rapportStockPharmacie(),
    ]);

  const ordonnancesJour = await prisma.ordonnance.findMany({
    where: { prescritLe: { gte: debut } },
    include: {
      medecin: { select: { prenom: true, nom: true } },
      dossier: {
        include: {
          patient: {
            select: {
              prenom: true,
              nom: true,
              numeroPatient: true,
              dateNaissance: true,
              sexe: true,
            },
          },
        },
      },
    },
    orderBy: { prescritLe: "desc" },
    take: 8,
  });

  const ordonnancesRecentes: OrdonnanceDashboardPharmacie[] = ordonnancesJour.map((o) => ({
    id: o.id,
    reference: libelleOrdonnance(o.id),
    nomComplet: `${o.dossier.patient.prenom} ${o.dossier.patient.nom}`.trim(),
    sexeAge: formaterSexeAge(
      o.dossier.patient.sexe,
      calculerAge(o.dossier.patient.dateNaissance?.toISOString() ?? null)
    ),
    heure: formaterHeure(o.prescritLe.toISOString()),
    statut: o.statut === "EN_ATTENTE" ? "Nouvelle" : o.statut,
    dossierId: o.dossierId,
  }));

  const topMedicaments = rapportVentes.topProduits.slice(0, 5).map((p) => ({
    nom: p.nom,
    quantite: p.quantite,
  }));

  const alertes: AlertePharmacieDashboard[] = [];

  for (const lot of rapportStock.lots.filter((l) => l.expire && l.quantite > 0).slice(0, 3)) {
    alertes.push({
      id: `exp-${lot.id}`,
      type: "perime",
      message: `${lot.medicament} — lot ${lot.numeroLot}`,
      libelle: "Périmé",
    });
  }
  for (const lot of rapportStock.lots.filter((l) => l.bientot && !l.expire).slice(0, 3)) {
    alertes.push({
      id: `bientot-${lot.id}`,
      type: "expiration",
      message: `${lot.medicament} expire bientôt`,
      libelle: "Expire bientôt",
    });
  }
  const medsFaibles = await prisma.medicament.findMany({
    where: { actif: true },
    select: { id: true, nom: true, stockMinimum: true },
    take: 50,
  });
  for (const m of medsFaibles) {
    const stock = rapportStock.lots
      .filter((l) => l.medicament === m.nom)
      .reduce((s, l) => s + l.quantite, 0);
    if (stock <= m.stockMinimum) {
      alertes.push({
        id: `stk-${m.id}`,
        type: stock === 0 ? "critique" : "stock_faible",
        message: stock === 0 ? `${m.nom} — rupture` : `${m.nom} — stock faible`,
        libelle: stock === 0 ? "Critique" : "Stock faible",
      });
    }
  }

  return {
    stats,
    ordonnancesRecentes,
    ordonnancesEnAttente: ordonnancesInbox.slice(0, 5),
    ventesEnAttente: ventesEnAttente.slice(0, 8),
    ventesPayees: ventesPayees.filter((v) => new Date(v.creeLe) >= debut).slice(0, 8),
    topMedicaments,
    alertes: alertes.slice(0, 8),
    chiffreAffairesJour: stats.chiffreAffairesJour,
  };
}
