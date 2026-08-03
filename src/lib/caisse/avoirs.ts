import "server-only";
import type { ModePaiement, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AgregatsAvoirsCaisse,
  LigneAvoirAvance,
  OptionCaissierRapport,
  RapportAvoirsPayload,
  TypeMouvementAvoir,
} from "@/lib/caisse/types";

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

function debutJournee(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function finJournee(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parserDateIso(valeur: string | undefined, fallback: Date): Date {
  if (!valeur || !/^\d{4}-\d{2}-\d{2}$/.test(valeur)) return fallback;
  const [y, m, j] = valeur.split("-").map(Number);
  const d = new Date(y!, m! - 1, j!);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function formaterCaissier(prenom: string, nom: string) {
  return `${prenom} ${nom}`.trim();
}

export function extraireModeFacture(reference: string | null | undefined): string | null {
  if (!reference) return null;
  return (
    reference
      .split("|")
      .find((part) => part.startsWith("modeFacture="))
      ?.replace("modeFacture=", "") ?? null
  );
}

export interface FiltresAvoirsCaisse {
  dateDu?: string;
  dateAu?: string;
  type?: TypeMouvementAvoir | "";
  caissierId?: string;
  q?: string;
}

export async function genererRapportAvoirs(
  filtres: FiltresAvoirsCaisse
): Promise<RapportAvoirsPayload> {
  const maintenant = new Date();
  const debutDefaut = new Date(maintenant);
  debutDefaut.setDate(debutDefaut.getDate() - 29);
  const debut = debutJournee(parserDateIso(filtres.dateDu, debutDefaut));
  const fin = finJournee(parserDateIso(filtres.dateAu, maintenant));
  const debutOk = debut <= fin ? debut : fin;
  const finOk = debut <= fin ? fin : debut;

  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const labelPeriode = `${fmt(debutOk)} → ${fmt(finOk)}`;

  const wherePaiements: Prisma.PaiementWhereInput = {
    payeLe: { gte: debutOk, lte: finOk },
    OR: [
      { reference: { contains: "modeFacture=AVANCE" } },
      { reference: { contains: "modeFacture=SOLDE" } },
    ],
  };
  if (filtres.caissierId?.trim()) wherePaiements.caissierId = filtres.caissierId.trim();
  const q = filtres.q?.trim();
  if (q) {
    wherePaiements.AND = [
      {
        OR: [
          { facture: { numeroFacture: { contains: q, mode: "insensitive" } } },
          { facture: { dossier: { patient: { nom: { contains: q, mode: "insensitive" } } } } },
          {
            facture: { dossier: { patient: { prenom: { contains: q, mode: "insensitive" } } } },
          },
          {
            facture: {
              dossier: { patient: { numeroPatient: { contains: q, mode: "insensitive" } } },
            },
          },
        ],
      },
    ];
  }

  const whereFacturesOuvertes: Prisma.FactureWhereInput = {
    createdAt: { gte: debutOk, lte: finOk },
    statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "BROUILLON"] },
  };
  if (q) {
    whereFacturesOuvertes.OR = [
      { numeroFacture: { contains: q, mode: "insensitive" } },
      { dossier: { patient: { nom: { contains: q, mode: "insensitive" } } } },
      { dossier: { patient: { prenom: { contains: q, mode: "insensitive" } } } },
      { dossier: { patient: { numeroPatient: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [paiements, facturesOuvertes, caissiersActifs] = await Promise.all([
    prisma.paiement.findMany({
      where: wherePaiements,
      include: {
        caissier: { select: { id: true, prenom: true, nom: true } },
        facture: {
          include: { dossier: { include: { patient: true } } },
        },
      },
      orderBy: { payeLe: "desc" },
    }),
    prisma.facture.findMany({
      where: whereFacturesOuvertes,
      include: {
        dossier: { include: { patient: true } },
        paiements: { orderBy: { payeLe: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.paiement.findMany({
      where: {
        payeLe: { gte: debutOk, lte: finOk },
        OR: [
          { reference: { contains: "modeFacture=AVANCE" } },
          { reference: { contains: "modeFacture=SOLDE" } },
        ],
      },
      select: {
        caissierId: true,
        caissier: { select: { id: true, prenom: true, nom: true } },
      },
      distinct: ["caissierId"],
    }),
  ]);

  const ledgerMouvements: LigneAvoirAvance[] = paiements.map((p) => {
    const modeFacture = extraireModeFacture(p.reference);
    const type: TypeMouvementAvoir = modeFacture === "SOLDE" ? "SOLDE" : "AVANCE";
    const montantTotal = decimalVersNombre(p.facture.montantTotal);
    const montantPaye = decimalVersNombre(p.facture.montantPaye);
    return {
      id: p.id,
      type,
      payeLe: p.payeLe.toISOString(),
      emiseLe: p.facture.emiseLe?.toISOString() ?? null,
      numeroFacture: p.facture.numeroFacture,
      dossierId: p.facture.dossierId,
      patient: `${p.facture.dossier.patient.prenom} ${p.facture.dossier.patient.nom}`,
      mode: p.mode as ModePaiement,
      modeFacture,
      caissier: formaterCaissier(p.caissier.prenom, p.caissier.nom),
      montant: decimalVersNombre(p.montant),
      montantTotal,
      montantPaye,
      reste: Math.max(0, montantTotal - montantPaye),
      devise: p.facture.devise,
      statutFacture: p.facture.statut,
    };
  });

  const idsFacturesDeja = new Set(ledgerMouvements.map((l) => l.numeroFacture));
  const ledgerOuverts: LigneAvoirAvance[] = facturesOuvertes
    .filter((f) => !idsFacturesDeja.has(f.numeroFacture))
    .map((f) => {
      const montantTotal = decimalVersNombre(f.montantTotal);
      const montantPaye = decimalVersNombre(f.montantPaye);
      const dernier = f.paiements[0] ?? null;
      return {
        id: `ouvert-${f.id}`,
        type: "OUVERT" as const,
        payeLe: dernier?.payeLe.toISOString() ?? null,
        emiseLe: f.emiseLe?.toISOString() ?? null,
        numeroFacture: f.numeroFacture,
        dossierId: f.dossierId,
        patient: `${f.dossier.patient.prenom} ${f.dossier.patient.nom}`,
        mode: dernier?.mode ?? null,
        modeFacture: extraireModeFacture(dernier?.reference),
        caissier: null,
        montant: montantPaye,
        montantTotal,
        montantPaye,
        reste: Math.max(0, montantTotal - montantPaye),
        devise: f.devise,
        statutFacture: f.statut,
      };
    });

  let ledger = [...ledgerMouvements, ...ledgerOuverts];
  if (filtres.type) {
    ledger = ledger.filter((l) => l.type === filtres.type);
  }

  ledger.sort((a, b) => {
    const da = a.payeLe ?? a.emiseLe ?? "";
    const db = b.payeLe ?? b.emiseLe ?? "";
    return db.localeCompare(da);
  });

  const agregats: AgregatsAvoirsCaisse = {
    avancesCount: ledger.filter((l) => l.type === "AVANCE").length,
    avancesMontant: ledger
      .filter((l) => l.type === "AVANCE")
      .reduce((a, l) => a + l.montant, 0),
    soldesCount: ledger.filter((l) => l.type === "SOLDE").length,
    soldesMontant: ledger
      .filter((l) => l.type === "SOLDE")
      .reduce((a, l) => a + l.montant, 0),
    ouvertesCount: ledger.filter((l) => l.type === "OUVERT" || l.reste > 0).length,
    resteDu: ledger
      .filter((l) => l.type === "OUVERT" || l.reste > 0)
      .reduce((a, l) => a + l.reste, 0),
  };

  // Avoid double-counting reste from both AVANCE lines and OUVERT for same facture
  const resteParFacture = new Map<string, number>();
  for (const l of ledger) {
    if (l.reste > 0) {
      const prev = resteParFacture.get(l.numeroFacture) ?? 0;
      if (l.reste > prev) resteParFacture.set(l.numeroFacture, l.reste);
    }
  }
  agregats.resteDu = [...resteParFacture.values()].reduce((a, n) => a + n, 0);
  agregats.ouvertesCount = resteParFacture.size;

  const optionsCaissiers: OptionCaissierRapport[] = caissiersActifs
    .map((c) => ({
      id: c.caissier.id,
      nom: formaterCaissier(c.caissier.prenom, c.caissier.nom),
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  return {
    debut: debutOk.toISOString(),
    fin: finOk.toISOString(),
    labelPeriode,
    devise: "USD",
    agregats,
    ledger,
    optionsCaissiers,
  };
}
