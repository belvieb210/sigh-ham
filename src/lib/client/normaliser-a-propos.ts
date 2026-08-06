/** Normalise le JSON PagePublique `a-propos` (seed imbriqué ou éditeur plat). */

export type ImageFondAPropos = { url: string; alt?: string };

export type ValeurAPropos = {
  id: string;
  titre: string;
  description: string;
};

export type ContenuAProposNormalise = {
  hero: {
    typeEtablissement: string;
    nom: string;
    badgeSlogan: string;
    suiteSlogan: string;
    descriptionCarte: string;
    imagesFond: ImageFondAPropos[];
  };
  mission: { titre: string; texte: string; imageUrl?: string };
  vision: { titre: string; texte: string };
  valeurs: ValeurAPropos[];
  histoire: { titre: string; paragraphes: string[] };
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export function normaliserContenuAPropos(
  raw: unknown,
  fallback: ContenuAProposNormalise
): ContenuAProposNormalise {
  const root = asRecord(raw) ?? {};
  const heroRaw = asRecord(root.hero) ?? root;
  const missionRaw = asRecord(root.mission) ?? {};
  const visionRaw = asRecord(root.vision) ?? {};
  const histoireRaw = asRecord(root.histoire) ?? {};

  const imagesFondRaw =
    (heroRaw.imagesFond as unknown) ??
    root.imagesFond ??
    fallback.hero.imagesFond;
  const imagesFond: ImageFondAPropos[] = Array.isArray(imagesFondRaw)
    ? imagesFondRaw
        .map((item): ImageFondAPropos | null => {
          if (typeof item === "string") return { url: item, alt: "" };
          const o = asRecord(item);
          if (!o?.url) return null;
          return { url: String(o.url), alt: asString(o.alt) };
        })
        .filter((x): x is ImageFondAPropos => x != null)
    : fallback.hero.imagesFond;

  let valeurs: ValeurAPropos[] = fallback.valeurs;
  const valeursRaw = root.valeurs;
  if (Array.isArray(valeursRaw) && valeursRaw.length > 0) {
    if (typeof valeursRaw[0] === "string") {
      valeurs = (valeursRaw as string[]).map((titre, i) => ({
        id: `v-${i}`,
        titre,
        description: "",
      }));
    } else {
      valeurs = valeursRaw
        .map((item, i) => {
          const o = asRecord(item);
          if (!o) return null;
          return {
            id: asString(o.id, `v-${i}`),
            titre: asString(o.titre, asString(o.nom)),
            description: asString(o.description),
          };
        })
        .filter((x): x is ValeurAPropos => Boolean(x?.titre));
    }
  }

  const paragraphesRaw =
    histoireRaw.paragraphes ?? root.histoireParagraphes;
  let paragraphes = fallback.histoire.paragraphes;
  if (Array.isArray(paragraphesRaw)) {
    paragraphes = paragraphesRaw.map(String).filter(Boolean);
  } else if (typeof paragraphesRaw === "string") {
    paragraphes = paragraphesRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  return {
    hero: {
      typeEtablissement: asString(
        heroRaw.typeEtablissement ?? root.typeEtablissement,
        fallback.hero.typeEtablissement
      ),
      nom: asString(heroRaw.nom ?? root.nomEtablissement, fallback.hero.nom),
      badgeSlogan: asString(
        heroRaw.badgeSlogan ?? root.badgeSlogan,
        fallback.hero.badgeSlogan
      ),
      suiteSlogan: asString(
        heroRaw.suiteSlogan ?? root.suiteSlogan,
        fallback.hero.suiteSlogan
      ),
      descriptionCarte: asString(
        heroRaw.descriptionCarte ?? root.descriptionCarte,
        fallback.hero.descriptionCarte
      ),
      imagesFond:
        imagesFond.length > 0 ? imagesFond : fallback.hero.imagesFond,
    },
    mission: {
      titre: asString(
        missionRaw.titre ?? root.missionTitre,
        fallback.mission.titre
      ),
      texte: asString(
        missionRaw.texte ?? root.missionTexte ?? root.mission,
        fallback.mission.texte
      ),
      imageUrl:
        asString(missionRaw.imageUrl ?? root.missionImage) ||
        fallback.mission.imageUrl,
    },
    vision: {
      titre: asString(
        visionRaw.titre ?? root.visionTitre,
        fallback.vision.titre
      ),
      texte: asString(
        visionRaw.texte ?? root.visionTexte ?? root.vision,
        fallback.vision.texte
      ),
    },
    valeurs,
    histoire: {
      titre: asString(
        histoireRaw.titre ?? root.histoireTitre,
        fallback.histoire.titre
      ),
      paragraphes,
    },
  };
}

export function serialiserContenuAPropos(
  data: ContenuAProposNormalise
): ContenuAProposNormalise {
  return data;
}
