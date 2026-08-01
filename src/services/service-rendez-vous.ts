import type { DonneesReservationRendezVous } from "@/hooks/use-schemas-validation";

export type { DonneesReservationRendezVous };

export interface ReponseReservationRendezVous {
  succes: boolean;
  reference?: string;
}

/** Génère les dates disponibles (14 prochains jours ouvrables) */
export function genererDatesDisponibles(nombreJours = 21): string[] {
  const dates: string[] = [];
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  let compteur = 0;
  let offset = 0;

  while (compteur < nombreJours && offset < 45) {
    const date = new Date(aujourdhui);
    date.setDate(aujourdhui.getDate() + offset);
    offset++;

    const jourSemaine = date.getDay();
    if (jourSemaine === 0) continue;

    dates.push(formatDateIso(date));
    compteur++;
  }

  return dates;
}

/** Génère les créneaux horaires pour une date donnée */
export function genererCreneauxDisponibles(dateIso: string): string[] {
  const date = parseDateIso(dateIso);
  if (!date) return [];

  const jourSemaine = date.getDay();
  if (jourSemaine === 0) return [];

  const heureFin = jourSemaine === 6 ? 14 : 19;
  const creneaux: string[] = [];

  for (let h = 7; h < heureFin; h++) {
    creneaux.push(`${pad2(h)}:00`);
    if (h + 0.5 < heureFin) {
      creneaux.push(`${pad2(h)}:30`);
    }
  }

  const maintenant = new Date();
  const estAujourdhui =
    date.getFullYear() === maintenant.getFullYear() &&
    date.getMonth() === maintenant.getMonth() &&
    date.getDate() === maintenant.getDate();

  if (!estAujourdhui) return creneaux;

  return creneaux.filter((creneau) => {
    const [h, m] = creneau.split(":").map(Number);
    const slot = new Date(date);
    slot.setHours(h, m, 0, 0);
    return slot.getTime() > maintenant.getTime() + 30 * 60 * 1000;
  });
}

export function formaterDateAffichage(dateIso: string, locale = "fr-FR"): string {
  const date = parseDateIso(dateIso);
  if (!date) return dateIso;

  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** @deprecated Utiliser typesPrestation depuis useContenuRendezVous() */
export function obtenirLibellePrestation(_id: string): string {
  return _id;
}

function genererReference(): string {
  const maintenant = new Date();
  const datePart = [
    maintenant.getFullYear(),
    pad2(maintenant.getMonth() + 1),
    pad2(maintenant.getDate()),
  ].join("");
  const aleatoire = Math.floor(1000 + Math.random() * 9000);
  return `HAM-RDV-${datePart}-${aleatoire}`;
}

/** Soumet une demande de rendez-vous — Phase future : POST /api/rendez-vous */
export async function soumettreReservationRendezVous(
  donnees: DonneesReservationRendezVous
): Promise<ReponseReservationRendezVous> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (process.env.NODE_ENV === "development") {
    console.info("[Rendez-vous] Réservation :", donnees);
  }

  const reference = genererReference();

  return {
    succes: true,
    reference,
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDateIso(date: Date): string {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join("-");
}

function parseDateIso(dateIso: string): Date | null {
  const [y, m, d] = dateIso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
