import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

/** Invalide le cache Next.js après modification campagnes / publicités. */
export function invaliderCacheCampagnes(options?: {
  slug?: string;
  ancienSlug?: string;
}) {
  revalidateTag("campagnes");
  revalidatePath("/");
  revalidatePath("/campagnes");

  const slugs = new Set<string>();
  if (options?.slug) slugs.add(options.slug);
  if (options?.ancienSlug) slugs.add(options.ancienSlug);
  for (const slug of slugs) {
    revalidatePath(`/campagnes/${slug}`);
  }
}

/** Invalide le cache Next.js après modification du carrousel hero accueil. */
export function invaliderCacheHero() {
  revalidateTag("hero");
  revalidatePath("/");
}

const CHEMINS_PAGE_PUBLIQUE: Record<string, string[]> = {
  "a-propos": ["/a-propos"],
  services: ["/services"],
  campagnes: ["/campagnes"],
  contact: ["/contact"],
  accueil: ["/"],
  "rendez-vous": ["/rendez-vous"],
};

/** Invalide le cache après modification d'une page publique (CMS). */
export function invaliderCachePagePublique(cle: string) {
  revalidateTag(`page-${cle}`);
  const chemins = CHEMINS_PAGE_PUBLIQUE[cle] ?? [];
  for (const chemin of chemins) {
    revalidatePath(chemin);
  }
}

/** Invalide le cache après modification de la galerie photo. */
export function invaliderCacheGalerie() {
  revalidateTag("galerie");
  revalidatePath("/a-propos");
}

export const ENTETES_SANS_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
} as const;
