export type ImageFondHero = { url: string; alt?: string };

function estImageCms(url: string): boolean {
  return Boolean(url?.trim()) && !url.startsWith("/images/");
}

/** Extrait hero.imagesFond depuis le JSON PagePublique. */
export function extraireImagesFondHero(contenu: unknown): ImageFondHero[] {
  if (!contenu || typeof contenu !== "object") return [];
  const root = contenu as Record<string, unknown>;
  const hero = root.hero;
  if (!hero || typeof hero !== "object") return [];
  const raw = (hero as Record<string, unknown>).imagesFond;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): ImageFondHero | null => {
      if (typeof item === "string") {
        return estImageCms(item) ? { url: item, alt: "" } : null;
      }
      if (item && typeof item === "object" && "url" in item) {
        const url = String((item as { url: unknown }).url ?? "").trim();
        if (!estImageCms(url)) return null;
        const alt =
          "alt" in item && (item as { alt?: unknown }).alt
            ? String((item as { alt: unknown }).alt)
            : "legende" in item && (item as { legende?: unknown }).legende
              ? String((item as { legende: unknown }).legende)
              : "";
        return { url, alt };
      }
      return null;
    })
    .filter((x): x is ImageFondHero => x !== null);
}
