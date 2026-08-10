export interface AlerteFinTraitement {
  niveau: "ok" | "proche" | "aujourdhui" | "depasse";
  joursRestants: number;
}

export function calculerAlerteFinTraitement(finEffectiveLe: string): AlerteFinTraitement {
  const fin = new Date(finEffectiveLe);
  fin.setHours(0, 0, 0, 0);
  const auj = new Date();
  auj.setHours(0, 0, 0, 0);
  const diff = Math.ceil((fin.getTime() - auj.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { niveau: "depasse", joursRestants: diff };
  if (diff === 0) return { niveau: "aujourdhui", joursRestants: 0 };
  if (diff <= 2) return { niveau: "proche", joursRestants: diff };
  return { niveau: "ok", joursRestants: diff };
}

export function isoVersDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalVersIso(valeur: string): string {
  if (!valeur.trim()) return new Date().toISOString();
  return new Date(valeur).toISOString();
}

export function formaterDateAffichage(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function cleDateLigne(iso: string | null | undefined): string {
  if (!iso) return "Sans date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Sans date";
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
