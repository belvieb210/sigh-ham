import "server-only";
import type { ModePaiement, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { estClientWalkInPharmacie } from "@/lib/pharmacie/client-walk-in";
import type {
  AgregatsRapportCaisse,
  ComparaisonRapportCaisse,
  FactureOuverteRapport,
  FiltresRapportCaisse,
  LigneLedgerRapport,
  OptionCaissierRapport,
  PeriodeRapportCaisse,
  PointSerieRapport,
  RapportCaissePayload,
  RepartitionModeRapport,
} from "@/lib/caisse/types";

const MODES: ModePaiement[] = ["ESPECES", "MOBILE_MONEY", "CARTE", "VIREMENT", "CHEQUE"];

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

function parserMoisIso(valeur: string | undefined, fallback: Date): { debut: Date; fin: Date } {
  const base = fallback;
  let annee = base.getFullYear();
  let mois = base.getMonth();
  if (valeur && /^\d{4}-\d{2}$/.test(valeur)) {
    const [y, m] = valeur.split("-").map(Number);
    if (y && m && m >= 1 && m <= 12) {
      annee = y;
      mois = m - 1;
    }
  }
  const debut = new Date(annee, mois, 1, 0, 0, 0, 0);
  const fin = new Date(annee, mois + 1, 0, 23, 59, 59, 999);
  return { debut, fin };
}

function variationPct(actuel: number, precedent: number): number | null {
  if (precedent === 0) return actuel > 0 ? 100 : null;
  return Math.round(((actuel - precedent) / precedent) * 100);
}

function formaterCaissier(prenom: string, nom: string) {
  return `${prenom} ${nom}`.trim();
}

function labelJour(date: Date, locale = "fr-FR") {
  return date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

function labelPeriodeJournalier(date: Date, locale = "fr-FR") {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function labelPeriodeMensuel(date: Date, locale = "fr-FR") {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

function construireWherePaiements(
  debut: Date,
  fin: Date,
  filtres: FiltresRapportCaisse
): Prisma.PaiementWhereInput {
  const where: Prisma.PaiementWhereInput = {
    payeLe: { gte: debut, lte: fin },
  };
  if (filtres.mode) where.mode = filtres.mode;
  if (filtres.caissierId?.trim()) where.caissierId = filtres.caissierId.trim();
  const q = filtres.q?.trim();
  if (q) {
    where.OR = [
      { facture: { numeroFacture: { contains: q, mode: "insensitive" } } },
      { facture: { dossier: { patient: { nom: { contains: q, mode: "insensitive" } } } } },
      { facture: { dossier: { patient: { prenom: { contains: q, mode: "insensitive" } } } } },
      {
        facture: {
          dossier: { patient: { numeroPatient: { contains: q, mode: "insensitive" } } },
        },
      },
    ];
  }
  return where;
}

function construireWhereFactures(
  debut: Date,
  fin: Date,
  filtres: FiltresRapportCaisse
): Prisma.FactureWhereInput {
  const where: Prisma.FactureWhereInput = {
    createdAt: { gte: debut, lte: fin },
    statut: { not: "ANNULEE" },
  };
  const q = filtres.q?.trim();
  if (q) {
    where.OR = [
      { numeroFacture: { contains: q, mode: "insensitive" } },
      { dossier: { patient: { nom: { contains: q, mode: "insensitive" } } } },
      { dossier: { patient: { prenom: { contains: q, mode: "insensitive" } } } },
      { dossier: { patient: { numeroPatient: { contains: q, mode: "insensitive" } } } },
    ];
  }
  if (filtres.mode || filtres.caissierId?.trim()) {
    where.paiements = {
      some: {
        ...(filtres.mode ? { mode: filtres.mode } : {}),
        ...(filtres.caissierId?.trim() ? { caissierId: filtres.caissierId.trim() } : {}),
      },
    };
  }
  return where;
}

async function agregatsPeriode(
  debut: Date,
  fin: Date,
  filtres: FiltresRapportCaisse
): Promise<AgregatsRapportCaisse> {
  const [factures, paiements] = await Promise.all([
    prisma.facture.findMany({
      where: construireWhereFactures(debut, fin, filtres),
      select: { montantTotal: true, montantPaye: true, statut: true },
    }),
    prisma.paiement.findMany({
      where: construireWherePaiements(debut, fin, filtres),
      select: { montant: true },
    }),
  ]);

  const facturesMontant = factures.reduce((a, f) => a + decimalVersNombre(f.montantTotal), 0);
  const encaissementsMontant = paiements.reduce((a, p) => a + decimalVersNombre(p.montant), 0);
  const ouvertes = factures.filter(
    (f) => f.statut === "EMISE" || f.statut === "PARTIELLEMENT_PAYEE" || f.statut === "BROUILLON"
  );
  const resteDu = ouvertes.reduce(
    (a, f) => a + Math.max(0, decimalVersNombre(f.montantTotal) - decimalVersNombre(f.montantPaye)),
    0
  );

  return {
    facturesCount: factures.length,
    facturesMontant,
    encaissementsCount: paiements.length,
    encaissementsMontant,
    resteDu,
    facturesOuvertesCount: ouvertes.length,
  };
}

async function montantEncaissementsSimple(debut: Date, fin: Date): Promise<number> {
  const paiements = await prisma.paiement.findMany({
    where: { payeLe: { gte: debut, lte: fin } },
    select: { montant: true },
  });
  return paiements.reduce((a, p) => a + decimalVersNombre(p.montant), 0);
}

function construireSerieJournaliere(
  paiements: { payeLe: Date; montant: unknown }[]
): PointSerieRapport[] {
  const buckets = Array.from({ length: 24 }, (_, h) => ({
    cle: String(h).padStart(2, "0"),
    label: `${String(h).padStart(2, "0")}h`,
    montant: 0,
  }));
  for (const p of paiements) {
    const h = p.payeLe.getHours();
    buckets[h]!.montant += decimalVersNombre(p.montant as never);
  }
  const actifs = buckets.filter((b) => b.montant > 0);
  if (actifs.length === 0) return buckets.filter((_, i) => i % 3 === 0);
  const minH = Math.min(...actifs.map((b) => Number(b.cle)));
  const maxH = Math.max(...actifs.map((b) => Number(b.cle)));
  return buckets.slice(minH, maxH + 1);
}

function cleJourLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const j = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${j}`;
}

function construireSerieMensuelle(
  debut: Date,
  fin: Date,
  paiements: { payeLe: Date; montant: unknown }[]
): PointSerieRapport[] {
  const jours: PointSerieRapport[] = [];
  const curseur = new Date(debut);
  while (curseur <= fin) {
    const cle = cleJourLocal(curseur);
    jours.push({
      cle,
      label: labelJour(curseur),
      montant: 0,
    });
    curseur.setDate(curseur.getDate() + 1);
  }
  const index = new Map(jours.map((j, i) => [j.cle, i]));
  for (const p of paiements) {
    const cle = cleJourLocal(p.payeLe);
    const i = index.get(cle);
    if (i != null) jours[i]!.montant += decimalVersNombre(p.montant as never);
  }
  return jours;
}

export async function genererRapportCaisse(
  filtres: FiltresRapportCaisse
): Promise<RapportCaissePayload> {
  const maintenant = new Date();
  const periode: PeriodeRapportCaisse =
    filtres.periode === "mensuel"
      ? "mensuel"
      : filtres.periode === "plage"
        ? "plage"
        : "journalier";

  let debut: Date;
  let fin: Date;
  let labelPeriode: string;
  let comparaison: ComparaisonRapportCaisse;

  if (periode === "mensuel") {
    const bornes = parserMoisIso(filtres.mois, maintenant);
    debut = bornes.debut;
    fin = bornes.fin;
    labelPeriode = labelPeriodeMensuel(debut);
    const debutPrec = new Date(debut.getFullYear(), debut.getMonth() - 1, 1, 0, 0, 0, 0);
    const finPrec = new Date(debut.getFullYear(), debut.getMonth(), 0, 23, 59, 59, 999);
    const montantPrec = await montantEncaissementsSimple(debutPrec, finPrec);
    comparaison = {
      labelPrecedent: labelPeriodeMensuel(debutPrec),
      encaissementsMontantPrecedent: montantPrec,
      variationPct: null,
    };
  } else if (periode === "plage") {
    const du = parserDateIso(filtres.dateDu, (() => {
      const d = new Date(maintenant);
      d.setDate(d.getDate() - 29);
      return d;
    })());
    const au = parserDateIso(filtres.dateAu, maintenant);
    debut = debutJournee(du <= au ? du : au);
    fin = finJournee(du <= au ? au : du);
    const fmt = (d: Date) =>
      d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    labelPeriode = `${fmt(debut)} → ${fmt(fin)}`;
    const dureeMs = fin.getTime() - debut.getTime();
    const finPrec = new Date(debut.getTime() - 1);
    const debutPrec = new Date(finPrec.getTime() - dureeMs);
    const montantPrec = await montantEncaissementsSimple(
      debutJournee(debutPrec),
      finJournee(finPrec)
    );
    comparaison = {
      labelPrecedent: `${fmt(debutPrec)} → ${fmt(finPrec)}`,
      encaissementsMontantPrecedent: montantPrec,
      variationPct: null,
    };
  } else {
    const jour = parserDateIso(filtres.date, maintenant);
    debut = debutJournee(jour);
    fin = finJournee(jour);
    labelPeriode = labelPeriodeJournalier(debut);
    const debutPrec = new Date(debut);
    debutPrec.setDate(debutPrec.getDate() - 1);
    const finPrec = finJournee(debutPrec);
    const montantPrec = await montantEncaissementsSimple(debutPrec, finPrec);
    comparaison = {
      labelPrecedent: labelPeriodeJournalier(debutPrec),
      encaissementsMontantPrecedent: montantPrec,
      variationPct: null,
    };
  }

  const wherePaiements = construireWherePaiements(debut, fin, filtres);

  const [agregats, paiementsRows, facturesOuvertesRows, caissiersActifs] = await Promise.all([
    agregatsPeriode(debut, fin, filtres),
    prisma.paiement.findMany({
      where: wherePaiements,
      include: {
        caissier: { select: { id: true, prenom: true, nom: true } },
        facture: {
          include: {
            dossier: { include: { patient: true } },
          },
        },
      },
      orderBy: { payeLe: "desc" },
    }),
    prisma.facture.findMany({
      where: {
        ...construireWhereFactures(debut, fin, filtres),
        statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "BROUILLON"] },
      },
      include: {
        dossier: { include: { patient: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.paiement.findMany({
      where: { payeLe: { gte: debut, lte: fin } },
      select: {
        caissierId: true,
        caissier: { select: { id: true, prenom: true, nom: true } },
      },
      distinct: ["caissierId"],
    }),
  ]);

  const totalEncaisse = agregats.encaissementsMontant || 1;
  const compteursModes = new Map<ModePaiement, { count: number; montant: number }>();
  for (const mode of MODES) compteursModes.set(mode, { count: 0, montant: 0 });

  const compteursCaissiers = new Map<
    string,
    { nom: string; count: number; montant: number }
  >();

  const ledger: LigneLedgerRapport[] = paiementsRows.map((p) => {
    const montant = decimalVersNombre(p.montant);
    const modeBucket = compteursModes.get(p.mode) ?? { count: 0, montant: 0 };
    modeBucket.count += 1;
    modeBucket.montant += montant;
    compteursModes.set(p.mode, modeBucket);

    const caisseBucket = compteursCaissiers.get(p.caissierId) ?? {
      nom: formaterCaissier(p.caissier.prenom, p.caissier.nom),
      count: 0,
      montant: 0,
    };
    caisseBucket.count += 1;
    caisseBucket.montant += montant;
    compteursCaissiers.set(p.caissierId, caisseBucket);

    return {
      id: p.id,
      payeLe: p.payeLe.toISOString(),
      numeroFacture: p.facture.numeroFacture,
      dossierId: p.facture.dossierId,
      patient: `${p.facture.dossier.patient.prenom} ${p.facture.dossier.patient.nom}`,
      estClientWalkIn: estClientWalkInPharmacie(p.facture.dossier.numeroDossier),
      mode: p.mode,
      caissier: formaterCaissier(p.caissier.prenom, p.caissier.nom),
      caissierId: p.caissierId,
      montant,
      devise: p.facture.devise,
    };
  });

  const repartitionModes: RepartitionModeRapport[] = MODES.map((mode) => {
    const b = compteursModes.get(mode)!;
    return {
      mode,
      count: b.count,
      montant: b.montant,
      partPct: Math.round((b.montant / totalEncaisse) * 1000) / 10,
    };
  }).filter((r) => r.count > 0 || r.montant > 0);

  const caissiers = [...compteursCaissiers.entries()]
    .map(([caissierId, v]) => ({
      caissierId,
      nom: v.nom,
      count: v.count,
      montant: v.montant,
    }))
    .sort((a, b) => b.montant - a.montant);

  const optionsCaissiers: OptionCaissierRapport[] = caissiersActifs
    .map((c) => ({
      id: c.caissier.id,
      nom: formaterCaissier(c.caissier.prenom, c.caissier.nom),
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  const facturesOuvertes: FactureOuverteRapport[] = facturesOuvertesRows.map((f) => {
    const montantTotal = decimalVersNombre(f.montantTotal);
    const montantPaye = decimalVersNombre(f.montantPaye);
    return {
      id: f.id,
      dossierId: f.dossierId,
      numeroFacture: f.numeroFacture,
      patient: `${f.dossier.patient.prenom} ${f.dossier.patient.nom}`,
      statut: f.statut,
      montantTotal,
      montantPaye,
      reste: Math.max(0, montantTotal - montantPaye),
      devise: f.devise,
      emiseLe: f.emiseLe?.toISOString() ?? null,
    };
  });

  const serie =
    periode === "journalier"
      ? construireSerieJournaliere(
          paiementsRows.map((p) => ({ payeLe: p.payeLe, montant: p.montant }))
        )
      : construireSerieMensuelle(
          debut,
          fin,
          paiementsRows.map((p) => ({ payeLe: p.payeLe, montant: p.montant }))
        );

  comparaison = {
    ...comparaison,
    variationPct: variationPct(
      agregats.encaissementsMontant,
      comparaison.encaissementsMontantPrecedent
    ),
  };

  return {
    periode,
    debut: debut.toISOString(),
    fin: fin.toISOString(),
    labelPeriode,
    devise: "USD",
    agregats,
    comparaison,
    repartitionModes,
    caissiers,
    serie,
    ledger,
    facturesOuvertes,
    optionsCaissiers,
  };
}
