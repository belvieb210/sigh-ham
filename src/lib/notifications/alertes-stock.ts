import "server-only";
import { prisma } from "@/lib/prisma";
import type { TypeNotification } from "@/generated/prisma/enums";
import { metadonneesNotificationI18n } from "@/lib/notifications/cles-i18n";
import { notifierSalle } from "@/lib/notifications/service-notifications";
import { stockDisponibleMedicament } from "@/lib/pharmacie/stock-fefo";

const SEUILS_JOURS = [5, 2, 0] as const;
const INTERVALLE_BALAYAGE_MS = 60 * 1000;

let dernierBalayage = 0;

export function debutJourLocal(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function joursRestantsExpiration(expiration: Date, aujourdHui = new Date()) {
  const a = debutJourLocal(aujourdHui).getTime();
  const e = debutJourLocal(expiration).getTime();
  return Math.round((e - a) / 86_400_000);
}

async function dejaAlerteAujourdhui(type: TypeNotification, entiteId: string) {
  const existante = await prisma.notification.findFirst({
    where: {
      type,
      entiteId,
      creeLe: { gte: debutJourLocal() },
    },
    select: { id: true },
  });
  return Boolean(existante);
}

async function notifierAdminEtPharmacie(params: {
  type: TypeNotification;
  titre: string;
  message: string;
  entiteId: string;
  metadonnees: Record<string, unknown>;
}) {
  const base = {
    type: params.type,
    titre: params.titre,
    message: params.message,
    entite: "medicament",
    entiteId: params.entiteId,
    metadonnees: params.metadonnees,
  };

  await Promise.all([
    notifierSalle("PHARMACIE", { ...base, module: "PHARMACIE", lien: "/sigh/pharmacie/stock" }),
    notifierSalle("ADMIN", { ...base, module: "ADMIN", lien: "/sigh/admin/medicaments" }),
  ]);
}

async function alerterNiveauStock(med: {
  id: string;
  nom: string;
  code: string;
  stockMinimum: number;
}) {
  const quantite = await stockDisponibleMedicament(med.id);
  const type: TypeNotification = quantite <= 0 ? "STOCK_EPUISE" : "STOCK_FAIBLE";
  if (quantite > 0 && quantite > med.stockMinimum) return;

  const entiteId = `${med.id}:${type}`;
  if (await dejaAlerteAujourdhui(type, entiteId)) return;

  const titre = type === "STOCK_EPUISE" ? "Rupture de stock" : "Stock faible";
  const message =
    type === "STOCK_EPUISE"
      ? `${med.nom} (${med.code}) n’a plus d’unités disponibles.`
      : `${med.nom} (${med.code}) : ${quantite} unité(s) restante(s) (seuil ${med.stockMinimum}).`;

  await notifierAdminEtPharmacie({
    type,
    titre,
    message,
    entiteId,
    metadonnees: metadonneesNotificationI18n(type, {
      nom: med.nom,
      code: med.code,
      quantite,
      seuil: med.stockMinimum,
    }),
  });
}

async function alerterExpiration(opts: {
  nom: string;
  code: string;
  lotId: string;
  numeroLot?: string | null;
  expirationLe: Date;
}) {
  const jours = joursRestantsExpiration(opts.expirationLe);
  const palier =
    jours < 0 ? "expire" : SEUILS_JOURS.includes(jours as (typeof SEUILS_JOURS)[number])
      ? String(jours)
      : null;
  if (!palier) return;

  const type: TypeNotification = "MEDICAMENT_EXPIRATION";
  const entiteId = `${opts.lotId}:j${palier}`;
  if (await dejaAlerteAujourdhui(type, entiteId)) return;

  const dateTxt = opts.expirationLe.toLocaleDateString("fr-FR");
  const lotTxt = opts.numeroLot ? ` — lot ${opts.numeroLot}` : "";
  let titre = "Péremption proche";
  let message = `${opts.nom} (${opts.code})${lotTxt} expire dans ${jours} jour(s) (${dateTxt}).`;
  if (jours === 0) {
    titre = "Péremption aujourd’hui";
    message = `${opts.nom} (${opts.code})${lotTxt} expire aujourd’hui (${dateTxt}).`;
  } else if (jours < 0) {
    titre = "Médicament périmé";
    message = `${opts.nom} (${opts.code})${lotTxt} est périmé depuis le ${dateTxt}.`;
  } else if (jours === 2) {
    titre = "Péremption dans 2 jours";
  } else if (jours === 5) {
    titre = "Péremption dans 5 jours";
  }

  await notifierAdminEtPharmacie({
    type,
    titre,
    message,
    entiteId,
    metadonnees: metadonneesNotificationI18n(type, {
      nom: opts.nom,
      code: opts.code,
      jours,
      date: dateTxt,
      lot: opts.numeroLot ?? "",
    }),
  });
}

export async function evaluerAlertesMedicament(medicamentId: string) {
  const med = await prisma.medicament.findUnique({
    where: { id: medicamentId },
    include: {
      lots: {
        where: { quantite: { gt: 0 } },
        select: {
          id: true,
          numeroLot: true,
          expirationLe: true,
        },
      },
    },
  });
  if (!med?.actif) return;

  await alerterNiveauStock(med);

  for (const lot of med.lots) {
    await alerterExpiration({
      nom: med.nom,
      code: med.code,
      lotId: lot.id,
      numeroLot: lot.numeroLot,
      expirationLe: lot.expirationLe,
    });
  }

  if (med.expirationLe) {
    await alerterExpiration({
      nom: med.nom,
      code: med.code,
      lotId: `fiche:${med.id}`,
      numeroLot: null,
      expirationLe: med.expirationLe,
    });
  }
}

export async function balayerAlertesStock() {
  const meds = await prisma.medicament.findMany({
    where: { actif: true },
    select: { id: true },
  });
  for (const m of meds) {
    await evaluerAlertesMedicament(m.id);
  }
}

/** Au plus une passe toutes les 3 min (appelée depuis le poll notifications). */
export async function balayerAlertesStockSiNecessaire() {
  const maintenant = Date.now();
  if (maintenant - dernierBalayage < INTERVALLE_BALAYAGE_MS) return;
  dernierBalayage = maintenant;
  try {
    await balayerAlertesStock();
  } catch (error) {
    dernierBalayage = 0;
    console.error("[alertes-stock]", error);
  }
}
