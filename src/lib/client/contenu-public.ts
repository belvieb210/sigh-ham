import "server-only";
import { prisma } from "@/lib/prisma";
import { CAMPAGNES_PUBLICATIONS } from "@/constants/campagnes";
import { DIAPOSITIVES_HERO_ACCUEIL } from "@/constants/hero-accueil";
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
      orderBy: [{ datePublication: "desc" }, { createdAt: "desc" }],
    });
    if (rows.length > 0) {
      return rows.map(campagneDbVersPublication);
    }
  } catch (error) {
    console.error("[contenu-public] campagnes DB indisponible:", error);
  }
  return seulementPubliees
    ? CAMPAGNES_PUBLICATIONS.filter((c) => c.publie)
    : CAMPAGNES_PUBLICATIONS;
}

export async function chargerCampagneParSlug(
  slug: string
): Promise<CampagnePublication | null> {
  try {
    const row = await prisma.campagnePublique.findUnique({ where: { slug } });
    if (row?.publie) return campagneDbVersPublication(row);
    if (row && !row.publie) return null;
  } catch (error) {
    console.error("[contenu-public] campagne slug DB:", error);
  }
  return CAMPAGNES_PUBLICATIONS.find((c) => c.slug === slug && c.publie) ?? null;
}

export async function chargerDiapositivesHero(): Promise<
  DiapositiveHeroAccueil[]
> {
  try {
    const rows = await prisma.diapositiveHero.findMany({
      where: { actif: true },
      orderBy: { ordre: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((d) => ({
        id: d.id,
        url: d.url,
        alt: d.alt,
        ordre: d.ordre,
        publie: d.actif,
      }));
    }
  } catch (error) {
    console.error("[contenu-public] hero DB indisponible:", error);
  }
  return DIAPOSITIVES_HERO_ACCUEIL.filter((d) => d.publie).sort(
    (a, b) => a.ordre - b.ordre
  );
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

export type ServiceVitrinePublic = {
  id: string;
  slug: string;
  titre: string;
  description: string;
  imageUrl?: string;
  categorie: string;
  points: string[];
  badge?: string;
  href?: string;
  icone: string;
  ordre: number;
};

export async function chargerServicesVitrine(): Promise<ServiceVitrinePublic[]> {
  try {
    const rows = await prisma.serviceVitrine.findMany({
      where: { actif: true },
      orderBy: { ordre: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((s) => ({
        id: s.id,
        slug: s.slug,
        titre: s.titre,
        description: s.description,
        imageUrl: s.imageUrl ?? undefined,
        categorie: s.categorie,
        points: Array.isArray(s.pointsJson)
          ? (s.pointsJson as string[])
          : [],
        badge: s.badge ?? undefined,
        href: s.href ?? undefined,
        icone: s.icone,
        ordre: s.ordre,
      }));
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
    categorie: s.categorie,
    points: [...s.points],
    badge: "badge" in s ? (s as { badge?: string }).badge : undefined,
    href: s.href,
    icone: s.icone,
    ordre: i,
  }));
}

export type MedecinVitrinePublic = {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  bio?: string;
  photoUrl?: string;
  horaires?: string;
  ordre: number;
};

export async function chargerMedecinsVitrine(): Promise<MedecinVitrinePublic[]> {
  try {
    const rows = await prisma.medecinVitrine.findMany({
      where: { actif: true },
      orderBy: { ordre: "asc" },
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
      ordre: i,
    };
  });
}
