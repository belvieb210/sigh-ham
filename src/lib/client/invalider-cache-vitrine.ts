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

export const ENTETES_SANS_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
} as const;
