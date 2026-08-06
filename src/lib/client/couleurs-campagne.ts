/** Normalise les couleurs campagne (hex CMS vs anciennes classes Tailwind seed). */

const MAP_COULEURS_TAILWIND: Record<string, string> = {
  "bg-bleu-medical-clair": "#E8F4FC",
  "bg-red-50": "#FEF2F2",
  "bg-pink-50": "#FDF2F8",
  "bg-white": "#FFFFFF",
  "bg-indigo-50": "#EEF2FF",
  "bg-gray-50": "#F9FAFB",
  "bg-green-50": "#F0FDF4",
  "text-bleu-medical": "#0B6E99",
  "text-red-600": "#DC2626",
  "text-pink-600": "#DB2777",
  "text-blue-600": "#2563EB",
  "text-green-600": "#16A34A",
  "text-amber-600": "#D97706",
  "text-indigo-600": "#4F46E5",
  "from-bleu-medical/15 to-bleu-medical-clair": "#D6EAF8",
  "from-bleu-medical/20 to-bleu-medical-clair": "#D0E8F6",
  "from-red-100 to-rose-50": "#FEE2E2",
  "from-pink-100 to-pink-50": "#FCE7F3",
  "from-blue-100 to-blue-50": "#DBEAFE",
  "from-green-100 to-green-50": "#DCFCE7",
  "from-amber-100 to-amber-50": "#FEF3C7",
  "from-indigo-100 to-indigo-50": "#E0E7FF",
  "from-gray-100 to-gray-50": "#F3F4F6",
};

export function estCouleurHex(valeur: string | null | undefined): boolean {
  if (!valeur) return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(valeur.trim());
}

/** Valeur sûre pour `<input type="color">` (évite les erreurs console #rrggbb). */
export function versHexPourInputCouleur(
  valeur: string | null | undefined,
  fallback = "#0B6E99"
): string {
  const v = (valeur ?? "").trim();
  if (estCouleurHex(v)) {
    return v.length === 4
      ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`
      : v;
  }
  if (MAP_COULEURS_TAILWIND[v]) return MAP_COULEURS_TAILWIND[v];
  // Cherche un token connu dans une chaîne composite
  for (const [cle, hex] of Object.entries(MAP_COULEURS_TAILWIND)) {
    if (v.includes(cle) || cle.includes(v)) return hex;
  }
  return fallback;
}

/** Style / classes pour fond illustration campagne. */
export function styleFondCampagne(couleur: string | null | undefined): {
  className: string;
  style?: { background: string };
} {
  const v = (couleur ?? "").trim();
  if (estCouleurHex(v)) {
    return {
      className: "",
      style: {
        background: `linear-gradient(135deg, ${v}33 0%, ${v} 100%)`,
      },
    };
  }
  if (v.includes("from-") || v.startsWith("bg-")) {
    return { className: v };
  }
  const hex = versHexPourInputCouleur(v);
  return {
    className: "",
    style: {
      background: `linear-gradient(135deg, ${hex}33 0%, ${hex} 100%)`,
    },
  };
}

export function classeAccentCampagne(couleur: string | null | undefined): string {
  const v = (couleur ?? "").trim();
  if (v.startsWith("text-")) return v;
  return "text-bleu-medical";
}
