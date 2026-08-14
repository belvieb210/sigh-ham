import "server-only";
import { prisma } from "@/lib/prisma";
import { CONTENU_A_PROPOS } from "@/constants/a-propos";
import { CONTENU_SERVICES } from "@/constants/services";
import { campagneDbVersPublication } from "@/lib/client/mapper-campagne";
import type { CampagnePublication } from "@/types/campagnes";
import type { DiapositiveHeroAccueil } from "@/types/hero-accueil";

export async function chargerCampagnesPubliques(options?: {
  seulementPubliees?: boolean;
}): Promise<CampagnePublication[]> {
  const seulementPubliees = options?.seulementPubliees ?? true;
  try {
    const rows = await prisma.campagnePublique.findMany({
      where: seulementPubliees ? { publie: true } : undefined,
      include: { images: { orderBy: { ordre: "asc" } } },
      orderBy: [{ datePublication: "desc" }, { createdAt: "desc" }],
    });
    // CMS uniquement — plus de fallback constants/images statiques
    return rows.map(campagneDbVersPublication);
  } catch (error) {
    console.error("[contenu-public] campagnes DB indisponible:", error);
  }
  return [];
}

export async function chargerCampagneParSlug(
  slug: string
): Promise<CampagnePublication | null> {
  try {
    const row = await prisma.campagnePublique.findUnique({
      where: { slug },
      include: { images: { orderBy: { ordre: "asc" } } },
    });
    if (row?.publie) return campagneDbVersPublication(row);
    return null;
  } catch (error) {
    console.error("[contenu-public] campagne slug DB:", error);
  }
  return null;
}

export async function chargerDiapositivesHero(): Promise<
  DiapositiveHeroAccueil[]
> {
  try {
    const rows = await prisma.diapositiveHero.findMany({
      where: { actif: true },
      orderBy: { ordre: "asc" },
    });
    return rows
      .filter((d) => d.url && !d.url.startsWith("/images/"))
      .map((d) => ({
        id: d.id,
        url: d.url,
        alt: d.alt,
        ordre: d.ordre,
        publie: d.actif,
        titre: d.titre ?? undefined,
        lienHref: d.lienHref ?? undefined,
      }));
  } catch (error) {
    console.error("[contenu-public] hero DB indisponible:", error);
  }
  return [];
}

export async function chargerPagePublique(cle: string) {
  try {
    const page = await prisma.pagePublique.findUnique({ where: { cle } });
    if (page?.publie) {
      return {
        cle: page.cle,
        titre: page.titre,
        contenu: page.contenu as Record<string, unknown>,
      };
    }
  } catch (error) {
    console.error("[contenu-public] page DB:", error);
  }
  return null;
}

export type GalerieMediaPublic = {
  id: string;
  url: string;
  legende?: string;
  album: string;
  ordre: number;
};

export async function chargerGaleriePublique(): Promise<GalerieMediaPublic[]> {
  try {
    const rows = await prisma.mediaGalerie.findMany({
      where: { actif: true },
      orderBy: [{ album: "asc" }, { ordre: "asc" }, { createdAt: "asc" }],
    });
    return rows
      .filter((m) => m.url && !m.url.startsWith("/images/"))
      .map((m) => ({
        id: m.id,
        url: m.url,
        legende: m.legende ?? undefined,
        album: m.album,
        ordre: m.ordre,
      }));
  } catch (error) {
    console.error("[contenu-public] galerie DB:", error);
  }
  return [];
}

export type ServiceVitrinePublic = {
  id: string;
  slug: string;
  titre: string;
  description: string;
  imageUrl?: string;
  images: { url: string; legende?: string }[];
  categorie: string;
  points: string[];
  badge?: string;
  href?: string;
  icone: string;
  ordre: number;
  estPhare: boolean;
};

export async function chargerServicesVitrine(): Promise<ServiceVitrinePublic[]> {
  try {
    const rows = await prisma.serviceVitrine.findMany({
      where: { actif: true },
      include: { images: { orderBy: { ordre: "asc" } } },
      orderBy: { ordre: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((s) => {
        const images = s.images.map((i) => ({
          url: i.url,
          legende: i.legende ?? undefined,
        }));
        return {
          id: s.id,
          slug: s.slug,
          titre: s.titre,
          description: s.description,
          imageUrl: images[0]?.url ?? s.imageUrl ?? undefined,
          images:
            images.length > 0
              ? images
              : s.imageUrl
                ? [{ url: s.imageUrl }]
                : [],
          categorie: s.categorie,
          points: Array.isArray(s.pointsJson)
            ? (s.pointsJson as string[])
            : [],
          badge: s.badge ?? undefined,
          href: s.href ?? undefined,
          icone: s.icone,
          ordre: s.ordre,
          estPhare: s.estPhare,
        };
      });
    }
  } catch (error) {
    console.error("[contenu-public] services DB:", error);
  }
  return CONTENU_SERVICES.services.map((s, i) => ({
    id: s.id,
    slug: s.id,
    titre: s.titre,
    description: s.description,
    imageUrl: "imageUrl" in s ? (s.imageUrl as string | undefined) : undefined,
    images: [],
    categorie: s.categorie,
    points: [...s.points],
    badge: "badge" in s ? (s as { badge?: string }).badge : undefined,
    href: s.href,
    icone: s.icone,
    ordre: i,
    estPhare: i === 0,
  }));
}

export type CategorieEquipeVitrine =
  | "MEDECIN"
  | "PERSONNEL"
  | "RESPONSABLE_LABO"
  | "MEDECIN_EXTERNE"
  | "SERVICE_EGLISE";

export type MedecinVitrinePublic = {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  bio?: string;
  photoUrl?: string;
  horaires?: string;
  telephone?: string;
  email?: string;
  categorie: CategorieEquipeVitrine;
  ordre: number;
};

/** Équipe affichée sur À propos (hors SERVICE_EGLISE). */
export async function chargerMedecinsVitrine(options?: {
  inclureEglise?: boolean;
}): Promise<MedecinVitrinePublic[]> {
  const inclureEglise = options?.inclureEglise ?? false;
  try {
    const rows = await prisma.medecinVitrine.findMany({
      where: {
        actif: true,
        ...(inclureEglise
          ? {}
          : { NOT: { categorie: "SERVICE_EGLISE" } }),
      },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
    });
    if (rows.length > 0) {
      return rows.map((m) => ({
        id: m.id,
        nom: m.nom,
        prenom: m.prenom,
        specialite: m.specialite,
        bio: m.bio ?? undefined,
        photoUrl: m.photoUrl ?? undefined,
        horaires: m.horaires ?? undefined,
        telephone: m.telephone ?? undefined,
        email: m.email ?? undefined,
        categorie: (m.categorie || "MEDECIN") as CategorieEquipeVitrine,
        ordre: m.ordre,
      }));
    }
  } catch (error) {
    console.error("[contenu-public] medecins DB:", error);
  }
  return CONTENU_A_PROPOS.equipe.membres.map((m, i) => {
    const parts = m.nom.split(" ");
    return {
      id: m.id,
      prenom: parts[0] ?? m.nom,
      nom: parts.slice(1).join(" ") || m.nom,
      specialite: m.fonction,
      photoUrl: m.photoUrl,
      categorie: "MEDECIN" as const,
      ordre: i,
    };
  });
}
