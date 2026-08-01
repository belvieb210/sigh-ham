/** Mémorisation « Se souvenir » — identifiant uniquement, jamais le mot de passe */

const CLE_STOCKAGE = "ham-connexion-se-souvenir";
const DUREE_VALIDITE_JOURS = 30;

interface SouvenirConnexion {
  identifiant: string;
  enregistreLe: string;
}

function estExpire(enregistreLe: string): boolean {
  const date = new Date(enregistreLe);
  if (Number.isNaN(date.getTime())) return true;
  const expiration = new Date(date);
  expiration.setDate(expiration.getDate() + DUREE_VALIDITE_JOURS);
  return new Date() > expiration;
}

export function lireIdentifiantMemorise(): {
  identifiant: string;
  seSouvenir: boolean;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return null;

    const data = JSON.parse(brut) as SouvenirConnexion;
    if (!data.identifiant?.trim()) {
      effacerIdentifiantMemorise();
      return null;
    }

    if (estExpire(data.enregistreLe)) {
      effacerIdentifiantMemorise();
      return null;
    }

    return { identifiant: data.identifiant.trim(), seSouvenir: true };
  } catch {
    effacerIdentifiantMemorise();
    return null;
  }
}

export function enregistrerIdentifiantMemorise(identifiant: string): void {
  if (typeof window === "undefined") return;

  const valeur = identifiant.trim();
  if (!valeur) {
    effacerIdentifiantMemorise();
    return;
  }

  const data: SouvenirConnexion = {
    identifiant: valeur,
    enregistreLe: new Date().toISOString(),
  };

  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(data));
}

export function effacerIdentifiantMemorise(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLE_STOCKAGE);
}
