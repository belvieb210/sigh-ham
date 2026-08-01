import { CAMPAGNES_PUBLICATIONS } from "@/constants/campagnes";
import { CONTENU_SERVICES } from "@/constants/services";
import { ACCES_RAPIDES, SERVICES_MEDICAUX } from "@/constants/navigation";
import type { TraductionsSite } from "@/locales/types";

export type CategorieRecherche =
  | "page"
  | "service"
  | "campagne"
  | "acces"
  | "faq"
  | "prestation";

export interface ResultatRecherche {
  id: string;
  titre: string;
  description: string;
  href: string;
  categorie: CategorieRecherche;
  motsClefs: string;
  score?: number;
}

const HREF_SERVICES: Record<string, string> = Object.fromEntries(
  SERVICES_MEDICAUX.map((s) => [s.id, s.href])
);

const HREF_ACCES: Record<string, string> = Object.fromEntries(
  ACCES_RAPIDES.map((a) => [a.id, a.href])
);

function ajouter(
  resultats: ResultatRecherche[],
  item: Omit<ResultatRecherche, "motsClefs"> & { motsClefs?: string }
) {
  if (resultats.some((r) => r.id === item.id)) return;

  const motsClefs =
    item.motsClefs ??
    `${item.titre} ${item.description} ${item.categorie}`.toLowerCase();

  resultats.push({ ...item, motsClefs });
}

/** Construit l'index de recherche multilingue à partir des traductions actives */
export function construireIndexRecherche(
  t: TraductionsSite
): ResultatRecherche[] {
  const resultats: ResultatRecherche[] = [];
  const pages = t.pages;

  for (const [href, titre] of Object.entries(t.recherche.pages)) {
    const description =
      href === "/"
        ? t.hopital.description
        : href === "/services"
          ? pages.services.hero.description
          : href === "/campagnes"
            ? pages.campagnes.hero.description
            : href === "/contact"
              ? pages.contact.hero.description
              : href === "/rendez-vous"
                ? pages.rendezVous.hero.description
                : href === "/a-propos"
                  ? pages.aPropos.mission.texte.slice(0, 120)
                  : titre;

    ajouter(resultats, {
      id: `page-${href}`,
      titre,
      description,
      href,
      categorie: "page",
      motsClefs: `${titre} ${description} ${href}`.toLowerCase(),
    });
  }

  for (const [cle, label] of Object.entries(t.nav)) {
    const hrefMap: Record<string, string> = {
      accueil: "/",
      aPropos: "/a-propos",
      services: "/services",
      campagnes: "/campagnes",
      contact: "/contact",
      rendezVous: "/rendez-vous",
    };
    const href = hrefMap[cle];
    if (!href) continue;
    ajouter(resultats, {
      id: `nav-${cle}`,
      titre: label,
      description: t.recherche.pages[href] ?? label,
      href,
      categorie: "page",
    });
  }

  for (const id of Object.keys(t.accueil.services) as Array<
    keyof typeof t.accueil.services
  >) {
    const trad = t.accueil.services[id];
    ajouter(resultats, {
      id: `service-accueil-${id}`,
      titre: trad.titre,
      description: trad.description,
      href: HREF_SERVICES[id] ?? "/services",
      categorie: "service",
      motsClefs: `${trad.titre} ${trad.description} ${id} service`.toLowerCase(),
    });
  }

  for (const service of CONTENU_SERVICES.services) {
    const trad =
      pages.services.items[service.id as keyof typeof pages.services.items];
    if (!trad) continue;

    const points =
      "points" in trad && Array.isArray(trad.points)
        ? trad.points.join(" ")
        : "";

    ajouter(resultats, {
      id: `service-${service.id}`,
      titre: trad.titre,
      description: trad.description,
      href: `/services#${service.id}`,
      categorie: "service",
      motsClefs:
        `${trad.titre} ${trad.description} ${points} ${service.id} ${service.categorie}`.toLowerCase(),
    });
  }

  for (const domaine of CONTENU_SERVICES.specialites.domaines) {
    ajouter(resultats, {
      id: `specialite-${domaine.id}`,
      titre: domaine.titre,
      description: pages.services.specialites.titre,
      href: "/services#specialites",
      categorie: "service",
      motsClefs: `${domaine.titre} ${domaine.description} specialite analyse`.toLowerCase(),
    });
  }

  for (const campagne of CAMPAGNES_PUBLICATIONS.filter((c) => c.publie)) {
    const trad =
      pages.campagnes.items[
        campagne.id as keyof typeof pages.campagnes.items
      ];
    if (!trad) continue;

    ajouter(resultats, {
      id: `campagne-${campagne.id}`,
      titre: trad.titre,
      description: trad.extrait,
      href: campagne.href,
      categorie: "campagne",
      motsClefs:
        `${trad.titre} ${trad.extrait} ${"description" in trad ? trad.description : ""} ${campagne.categorie}`.toLowerCase(),
    });
  }

  for (const id of Object.keys(t.accueil.accesRapide) as Array<
    keyof typeof t.accueil.accesRapide
  >) {
    const trad = t.accueil.accesRapide[id];
    ajouter(resultats, {
      id: `acces-${id}`,
      titre: trad.titre,
      description: trad.sousTitre,
      href: HREF_ACCES[id] ?? "/",
      categorie: "acces",
    });
  }

  for (const [id, trad] of Object.entries(pages.rendezVous.types)) {
    ajouter(resultats, {
      id: `prestation-${id}`,
      titre: trad.titre,
      description: trad.description,
      href: "/rendez-vous",
      categorie: "prestation",
      motsClefs:
        `${trad.titre} ${trad.description} rendez-vous rdv ${id}`.toLowerCase(),
    });
  }

  for (const [id, label] of Object.entries(pages.contact.sujets)) {
    ajouter(resultats, {
      id: `sujet-${id}`,
      titre: label,
      description: pages.contact.formulaire.titre,
      href: "/contact#formulaire-contact",
      categorie: "page",
      motsClefs: `${label} contact formulaire ${id}`.toLowerCase(),
    });
  }

  pages.contact.faq.items.forEach((item, index) => {
    ajouter(resultats, {
      id: `faq-contact-${index}`,
      titre: item.question,
      description: item.reponse.slice(0, 140),
      href: "/contact#faq-contact",
      categorie: "faq",
      motsClefs: `${item.question} ${item.reponse} faq contact`.toLowerCase(),
    });
  });

  pages.rendezVous.faq.items.forEach((item, index) => {
    ajouter(resultats, {
      id: `faq-rdv-${index}`,
      titre: item.question,
      description: item.reponse.slice(0, 140),
      href: "/rendez-vous#faq-rdv",
      categorie: "faq",
      motsClefs: `${item.question} ${item.reponse} faq rendez-vous`.toLowerCase(),
    });
  });

  ajouter(resultats, {
    id: "apropos-mission",
    titre: pages.aPropos.mission.titre,
    description: pages.aPropos.mission.texte.slice(0, 140),
    href: "/a-propos",
    categorie: "page",
    motsClefs:
      `${pages.aPropos.mission.titre} ${pages.aPropos.mission.texte} ${pages.aPropos.vision.titre} ${t.hopital.slogan}`.toLowerCase(),
  });

  for (const [index, valeur] of pages.aPropos.valeurs.items.entries()) {
    ajouter(resultats, {
      id: `valeur-${index}`,
      titre: valeur.titre,
      description: valeur.description,
      href: "/a-propos",
      categorie: "page",
    });
  }

  ajouter(resultats, {
    id: "footer-app",
    titre: t.footer.applicationMobile,
    description: t.accueil.appDescription,
    href: "/application",
    categorie: "acces",
  });

  ajouter(resultats, {
    id: "hopital-info",
    titre: t.hopital.typeEtablissement,
    description: t.hopital.slogan,
    href: "/",
    categorie: "page",
    motsClefs:
      `${t.hopital.typeEtablissement} ${t.hopital.slogan} HAM laboratoire kinshasa matete analyses`.toLowerCase(),
  });

  return resultats;
}

export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function calculerScore(item: ResultatRecherche, mots: string[]): number {
  const titre = normaliser(item.titre);
  const description = normaliser(item.description);
  const haystack = normaliser(item.motsClefs);
  let score = 0;

  for (const mot of mots) {
    let trouve = false;
    if (titre === mot) {
      score += 100;
      trouve = true;
    } else if (titre.startsWith(mot)) {
      score += 60;
      trouve = true;
    } else if (titre.includes(mot)) {
      score += 40;
      trouve = true;
    } else if (description.includes(mot)) {
      score += 20;
      trouve = true;
    } else if (haystack.includes(mot)) {
      score += 10;
      trouve = true;
    }
    if (!trouve) return 0;
  }

  if (item.categorie === "page") score += 5;
  if (item.categorie === "service") score += 3;
  return score;
}

export function rechercherDansIndex(
  index: ResultatRecherche[],
  requete: string,
  limite = 15
): ResultatRecherche[] {
  const q = normaliser(requete);
  if (!q || q.length < 2) return [];

  const mots = q.split(/\s+/).filter(Boolean);

  return index
    .map((item) => ({ ...item, score: calculerScore(item, mots) }))
    .filter((item) => (item.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limite);
}

export function obtenirSuggestionsPopulaires(
  index: ResultatRecherche[],
  limite = 6
): ResultatRecherche[] {
  const idsPrioritaires = [
    "page-/rendez-vous",
    "page-/services",
    "service-laboratoire",
    "page-/contact",
    "page-/campagnes",
    "acces-rdv",
  ];

  const suggestions: ResultatRecherche[] = [];

  for (const id of idsPrioritaires) {
    const item = index.find((r) => r.id === id);
    if (item) suggestions.push(item);
    if (suggestions.length >= limite) break;
  }

  if (suggestions.length < limite) {
    for (const item of index) {
      if (suggestions.some((s) => s.id === item.id)) continue;
      if (item.categorie === "page" || item.categorie === "service") {
        suggestions.push(item);
      }
      if (suggestions.length >= limite) break;
    }
  }

  return suggestions;
}

export const ORDRE_CATEGORIES: CategorieRecherche[] = [
  "page",
  "service",
  "prestation",
  "campagne",
  "acces",
  "faq",
];

export function grouperParCategorie(
  resultats: ResultatRecherche[]
): Partial<Record<CategorieRecherche, ResultatRecherche[]>> {
  const groupes: Partial<Record<CategorieRecherche, ResultatRecherche[]>> = {};
  for (const resultat of resultats) {
    if (!groupes[resultat.categorie]) groupes[resultat.categorie] = [];
    groupes[resultat.categorie]!.push(resultat);
  }
  return groupes;
}
