"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CONTENU_A_PROPOS } from "@/constants/a-propos";
import {
  CONTENU_CAMPAGNES,
} from "@/constants/campagnes";
import { CONTENU_CONTACT } from "@/constants/contact";
import { CONTENU_RENDEZ_VOUS } from "@/constants/rendez-vous";
import { CONTENU_SERVICES } from "@/constants/services";
import { CONTENU_SERVICES_LABORATOIRE } from "@/constants/services-laboratoire";
import { useCampagnes } from "@/hooks/use-campagnes";
import { useStatistiquesVitrine } from "@/hooks/use-statistiques-vitrine";
import { normaliserContenuAPropos } from "@/lib/client/normaliser-a-propos";
import { extraireImagesFondHero } from "@/lib/client/extraire-images-fond-hero";
import {
  fusionnerIndicateursAvecStats,
  statistiquesHeroCampagnes,
} from "@/lib/client/statistiques-vitrine-utils";
import { formaterNombreVitrine } from "@/lib/client/formater-valeur-vitrine";
import type { PagesFr } from "@/locales/pages/fr";

function usePages(): PagesFr {
  const { i18n } = useTranslation();
  const langue = i18n.resolvedLanguage ?? i18n.language;

  return useMemo(() => {
    const bundle = i18n.getResourceBundle(langue, "translation");
    return (bundle?.pages ?? i18n.getResourceBundle("fr", "translation")?.pages) as PagesFr;
  }, [i18n, langue]);
}

function useImagesFondHeroPage(cle: string) {
  const { data } = useQuery({
    queryKey: ["public", "pages", cle, "images-fond"],
    queryFn: async () => {
      const res = await fetch(`/api/public/pages/${cle}`);
      if (!res.ok) return [];
      const json = (await res.json()) as { page?: { contenu?: unknown } };
      return extraireImagesFondHero(json.page?.contenu);
    },
    staleTime: 0,
  });
  return data ?? [];
}

export function useContenuContact() {
  const pages = usePages();
  const contact = pages.contact;
  const imagesFond = useImagesFondHeroPage("contact");

  return useMemo(
    () => ({
      hero: {
        surtitre: contact.hero.surtitre,
        titre: contact.hero.titre,
        titreAccent: contact.hero.titreAccent,
        description: contact.hero.description,
        imagesFond,
        statistiques: [
          {
            valeur: CONTENU_CONTACT.hero.statistiques[0].valeur,
            libelle: contact.hero.stats.delai,
          },
          {
            valeur: CONTENU_CONTACT.hero.statistiques[1].valeur,
            libelle: contact.hero.stats.lignes,
          },
          {
            valeur: CONTENU_CONTACT.hero.statistiques[2].valeur,
            libelle: contact.hero.stats.accueil,
          },
          {
            valeur: CONTENU_CONTACT.hero.statistiques[3].valeur,
            libelle: contact.hero.stats.ville,
          },
        ],
      },
      coordonnees: contact.coordonnees,
      formulaire: contact.formulaire,
      horaires: {
        titre: contact.horaires.titre,
        jours: [
          {
            jour: contact.horaires.lunVen,
            heures: contact.horaires.lunVenHeures,
          },
          { jour: contact.horaires.sam, heures: contact.horaires.samHeures },
          { jour: contact.horaires.dim, heures: contact.horaires.dimHeures },
        ],
      },
      sujetsFormulaire: CONTENU_CONTACT.sujetsFormulaire.map((sujet) => ({
        value: sujet.value,
        label:
          contact.sujets[sujet.value as keyof typeof contact.sujets] ??
          sujet.label,
      })),
      faq: CONTENU_CONTACT.faq.map((item, index) => ({
        id: item.id,
        question: contact.faq.items[index]?.question ?? item.question,
        reponse: contact.faq.items[index]?.reponse ?? item.reponse,
      })),
      faqSection: contact.faq,
      carteEmbed: CONTENU_CONTACT.carteEmbed,
      cta: {
        titre: contact.cta.titre,
        description: contact.cta.description,
        boutonRdv: {
          etiquette: contact.cta.boutonRdv,
          href: CONTENU_CONTACT.cta.boutonRdv.href,
        },
        boutonFormulaire: {
          etiquette: contact.cta.boutonFormulaire,
          href: CONTENU_CONTACT.cta.boutonFormulaire.href,
        },
        telephone: CONTENU_CONTACT.cta.telephone,
      },
    }),
    [contact, imagesFond]
  );
}

export function useContenuRendezVous() {
  const pages = usePages();
  const rdv = pages.rendezVous;
  const imagesFond = useImagesFondHeroPage("rendez-vous");

  return useMemo(
    () => ({
      hero: {
        surtitre: rdv.hero.surtitre,
        titre: rdv.hero.titre,
        titreAccent: rdv.hero.titreAccent,
        description: rdv.hero.description,
        imagesFond,
        statistiques: [
          {
            valeur: CONTENU_RENDEZ_VOUS.hero.statistiques[0].valeur,
            libelle: rdv.hero.stats.rapide,
          },
          {
            valeur: CONTENU_RENDEZ_VOUS.hero.statistiques[1].valeur,
            libelle: rdv.hero.stats.enLigne,
          },
          {
            valeur: CONTENU_RENDEZ_VOUS.hero.statistiques[2].valeur,
            libelle: rdv.hero.stats.confirmation,
          },
          {
            valeur: CONTENU_RENDEZ_VOUS.hero.statistiques[3].valeur,
            libelle: rdv.hero.stats.qualite,
          },
        ],
      },
      reservation: rdv.reservation,
      form: rdv.form,
      typesPrestation: CONTENU_RENDEZ_VOUS.typesPrestation.map((type) => {
        const trad = rdv.types[type.id as keyof typeof rdv.types];
        return {
          ...type,
          titre: trad?.titre ?? type.titre,
          description: trad?.description ?? type.description,
        };
      }),
      parcours: {
        titre: rdv.parcours.titre,
        sousTitre: rdv.parcours.sousTitre,
        etapes: CONTENU_RENDEZ_VOUS.parcours.etapes.map((etape, index) => ({
          numero: etape.numero,
          titre: rdv.parcours.etapes[index]?.titre ?? etape.titre,
          description:
            rdv.parcours.etapes[index]?.description ?? etape.description,
        })),
      },
      infosPratiques: {
        surtitre: rdv.infos.surtitre,
        titre: rdv.infos.titre,
        sousTitre: rdv.infos.sousTitre,
        items: CONTENU_RENDEZ_VOUS.infosPratiques.items.map((item, index) => ({
          id: item.id,
          icone: item.icone,
          titre: rdv.infos.items[index]?.titre ?? item.titre,
          description:
            rdv.infos.items[index]?.description ?? item.description,
        })),
      },
      faq: CONTENU_RENDEZ_VOUS.faq.map((item, index) => ({
        id: item.id,
        question: rdv.faq.items[index]?.question ?? item.question,
        reponse: rdv.faq.items[index]?.reponse ?? item.reponse,
      })),
      faqSection: rdv.faq,
      cta: {
        titre: rdv.cta.titre,
        description: rdv.cta.description,
        telephone: CONTENU_RENDEZ_VOUS.cta.telephone,
        boutonContact: {
          etiquette: rdv.cta.boutonContact,
          href: CONTENU_RENDEZ_VOUS.cta.boutonContact.href,
        },
        boutonReserver: {
          etiquette: rdv.cta.boutonReserver,
          href: CONTENU_RENDEZ_VOUS.cta.boutonReserver.href,
        },
      },
    }),
    [rdv, imagesFond]
  );
}

export function useContenuServices() {
  const pages = usePages();
  const services = pages.services;
  const imagesFond = useImagesFondHeroPage("services");
  const { data: stats } = useStatistiquesVitrine();
  const { data: servicesDb } = useQuery({
    queryKey: ["public", "services-vitrine"],
    queryFn: async () => {
      const res = await fetch("/api/public/services-vitrine");
      if (!res.ok) return null;
      const data = (await res.json()) as {
        services?: {
          id: string;
          slug: string;
          titre: string;
          description: string;
          imageUrl?: string;
          images?: { url: string; legende?: string }[];
          categorie: string;
          points: string[];
          badge?: string;
          href?: string;
          icone: string;
          estPhare?: boolean;
        }[];
      };
      return data.services ?? null;
    },
    staleTime: 60_000,
  });

  return useMemo(
    () => ({
      hero: {
        surtitre: services.hero.surtitre,
        titre: services.hero.titre,
        titreAccent: services.hero.titreAccent,
        description: services.hero.description,
        imagesFond,
        statistiques: [
          {
            valeur:
              stats && stats.typesAnalyses > 0
                ? formaterNombreVitrine(stats.typesAnalyses)
                : CONTENU_SERVICES.hero.statistiques[0].valeur,
            libelle: services.hero.stats.analyses,
          },
          {
            valeur: CONTENU_SERVICES.hero.statistiques[1].valeur,
            libelle: services.hero.stats.delai,
          },
          {
            valeur:
              stats && stats.certification
                ? stats.certification.replace(":2015", "").split(":")[0] ?? "ISO"
                : CONTENU_SERVICES.hero.statistiques[2].valeur,
            libelle: services.hero.stats.iso,
          },
          {
            valeur: CONTENU_SERVICES.hero.statistiques[3].valeur,
            libelle: services.hero.stats.accueil,
          },
        ],
      },
      categories: CONTENU_SERVICES.categories.map((cat) => ({
        id: cat.id,
        etiquette:
          services.categories[cat.id as keyof typeof services.categories] ??
          cat.etiquette,
      })),
      vedette: services.vedette,
      grille: services.grille,
      services: (servicesDb && servicesDb.length > 0
        ? servicesDb.map((s) => {
            const base = CONTENU_SERVICES.services.find((x) => x.id === s.slug);
            const trad =
              services.items[s.slug as keyof typeof services.items];
            return {
              id: s.slug,
              categorie: (s.categorie ||
                base?.categorie ||
                "diagnostic") as (typeof CONTENU_SERVICES.services)[number]["categorie"],
              titre: trad?.titre ?? s.titre,
              description: trad?.description ?? s.description,
              points: trad?.points ?? s.points,
              badge:
                s.badge ??
                (s.estPhare
                  ? "Service phare"
                  : "badge" in (base ?? {})
                    ? (base as { badge?: string }).badge
                    : undefined),
              estPhare: Boolean(s.estPhare),
              images:
                s.images && s.images.length > 0
                  ? s.images
                  : s.imageUrl
                    ? [{ url: s.imageUrl }]
                    : [],
              href: s.href ?? base?.href ?? `/services#${s.slug}`,
              imageUrl:
                s.imageUrl ??
                s.images?.[0]?.url ??
                ("imageUrl" in (base ?? {})
                  ? (base as { imageUrl?: string }).imageUrl
                  : undefined),
              icone: (s.icone || base?.icone || "laboratoire") as (typeof CONTENU_SERVICES.services)[number]["icone"],
              couleurIcone: base?.couleurIcone ?? "text-bleu-medical",
              fondIcone: base?.fondIcone ?? "bg-bleu-medical-clair",
              accent: base?.accent ?? "from-bleu-medical/10 to-bleu-medical-clair",
            };
          })
        : CONTENU_SERVICES.services.map((service) => {
            const trad =
              services.items[service.id as keyof typeof services.items];
            return {
              ...service,
              titre: trad?.titre ?? service.titre,
              description: trad?.description ?? service.description,
              points: trad?.points ?? service.points,
              badge:
                "badge" in (trad ?? {}) && trad && "badge" in trad
                  ? trad.badge
                  : "badge" in service
                    ? service.badge
                    : undefined,
            };
          })),
      impact: {
        titre: services.impact.titre,
        sousTitre: services.impact.sousTitre,
        indicateurs: fusionnerIndicateursAvecStats(
          CONTENU_SERVICES.impact.indicateurs.map((indicateur, index) => ({
            id: indicateur.id,
            valeur: indicateur.valeur,
            libelle:
              services.impact.items[index]?.libelle ?? indicateur.libelle,
            description:
              services.impact.items[index]?.description ??
              indicateur.description,
          })),
          stats
        ),
      },
      specialites: {
        titre: services.specialites.titre,
        sousTitre: services.specialites.sousTitre,
        domaines: CONTENU_SERVICES.specialites.domaines,
      },
      parcours: {
        titre: services.parcours.titre,
        sousTitre: services.parcours.sousTitre,
        etapes: CONTENU_SERVICES.parcours.etapes.map((etape, index) => ({
          numero: etape.numero,
          titre: services.parcours.etapes[index]?.titre ?? etape.titre,
          description:
            services.parcours.etapes[index]?.description ?? etape.description,
        })),
      },
      engagements: {
        titre: services.engagements.titre,
        sousTitre: services.engagements.sousTitre,
        items: CONTENU_SERVICES.engagements.items.map((item, index) => ({
          id: item.id,
          titre: services.engagements.items[index]?.titre ?? item.titre,
          description:
            services.engagements.items[index]?.description ?? item.description,
        })),
      },
      cta: {
        titre: services.cta.titre,
        description: services.cta.description,
        boutonPrincipal: {
          etiquette: services.cta.boutonPrincipal,
          href: CONTENU_SERVICES.cta.boutonPrincipal.href,
        },
        boutonSecondaire: {
          etiquette: services.cta.boutonSecondaire,
          href: CONTENU_SERVICES.cta.boutonSecondaire.href,
        },
        telephone: CONTENU_SERVICES.cta.telephone,
      },
    }),
    [services, servicesDb, imagesFond, stats]
  );
}

export function useContenuCampagnes() {
  const pages = usePages();
  const campagnes = pages.campagnes;
  const imagesFond = useImagesFondHeroPage("campagnes");
  const { data: stats } = useStatistiquesVitrine();

  return useMemo(
    () => {
      const heroStats = stats ? statistiquesHeroCampagnes(stats) : null;
      return {
      hero: {
        surtitre: campagnes.hero.surtitre,
        titre: campagnes.hero.titre,
        titreAccent: campagnes.hero.titreAccent,
        description: campagnes.hero.description,
        imagesFond,
        statistiques: [
          {
            valeur:
              heroStats?.sensibilises ??
              CONTENU_CAMPAGNES.hero.statistiques[0].valeur,
            libelle: campagnes.hero.stats.sensibilises,
          },
          {
            valeur:
              heroStats?.actions ??
              CONTENU_CAMPAGNES.hero.statistiques[1].valeur,
            libelle: campagnes.hero.stats.actions,
          },
          {
            valeur:
              heroStats?.satisfaction ??
              CONTENU_CAMPAGNES.hero.statistiques[2].valeur,
            libelle: campagnes.hero.stats.satisfaction,
          },
          {
            valeur:
              heroStats?.iso ?? CONTENU_CAMPAGNES.hero.statistiques[3].valeur,
            libelle: campagnes.hero.stats.iso,
          },
        ],
      },
      grille: campagnes.grille,
      impact: {
        titre: campagnes.impact.titre,
        sousTitre: campagnes.impact.sousTitre,
        indicateurs: fusionnerIndicateursAvecStats(
          CONTENU_CAMPAGNES.impact.indicateurs.map((indicateur, index) => ({
            id: indicateur.id,
            valeur: indicateur.valeur,
            libelle:
              campagnes.impact.items[index]?.libelle ?? indicateur.libelle,
            description:
              campagnes.impact.items[index]?.description ??
              indicateur.description,
          })),
          stats
        ),
      },
      parcours: {
        titre: campagnes.parcours.titre,
        sousTitre: campagnes.parcours.sousTitre,
        etapes: CONTENU_CAMPAGNES.parcours.etapes.map((etape, index) => ({
          numero: etape.numero,
          titre: campagnes.parcours.etapes[index]?.titre ?? etape.titre,
          description:
            campagnes.parcours.etapes[index]?.description ?? etape.description,
        })),
      },
      cta: {
        titre: campagnes.cta.titre,
        description: campagnes.cta.description,
        bouton: {
          etiquette: campagnes.cta.bouton,
          href: CONTENU_CAMPAGNES.cta.bouton.href,
        },
        boutonSecondaire: {
          etiquette: campagnes.cta.boutonSecondaire,
          href: CONTENU_CAMPAGNES.cta.boutonSecondaire.href,
        },
        telephone: CONTENU_CAMPAGNES.cta.telephone,
      },
      items: campagnes.items,
    };
    },
    [campagnes, imagesFond, stats]
  );
}

export function useCampagnesTraduits() {
  const pages = usePages();
  const items = pages.campagnes.items;
  const { data: campagnesDb } = useCampagnes();

  return useMemo(() => {
    const source = campagnesDb ?? [];

    return source.map((campagne) => {
      const trad = items[campagne.id as keyof typeof items];
      return {
        ...campagne,
        titre: trad?.titre ?? campagne.titre,
        extrait: trad?.extrait ?? campagne.extrait,
        description:
          (trad as { description?: string } | undefined)?.description ??
          campagne.description,
        periode:
          (trad as { periode?: string } | undefined)?.periode ??
          campagne.periode,
        lieu: (trad as { lieu?: string } | undefined)?.lieu ?? campagne.lieu,
      };
    });
  }, [items, campagnesDb]);
}

export function useContenuAPropos() {
  const pages = usePages();
  const aPropos = pages.aPropos;
  const { data: stats } = useStatistiquesVitrine();
  const { data: gouvernanceDb } = useQuery({
    queryKey: ["public", "gouvernance"],
    queryFn: async () => {
      const res = await fetch("/api/public/gouvernance");
      if (!res.ok) return null;
      const data = (await res.json()) as {
        responsable?: {
          id: string;
          nom: string;
          fonction: string;
          photoUrl?: string;
          biographie?: string;
          badges?: { valeur: string; libelle: string }[];
        } | null;
        services?: {
          salle: { id: string; code: string; nom: string; ordre: number };
          membres: {
            id: string;
            nom: string;
            fonction: string;
            photoUrl: string;
            telephone?: string;
            email?: string;
            bio?: string;
            categorie: string;
            masquerContactsPublic: boolean;
            ordre: number;
          }[];
        }[];
      };
      return data;
    },
    staleTime: 60_000,
  });

  const { data: pageDb } = useQuery({
    queryKey: ["public", "pages", "a-propos"],
    queryFn: async () => {
      const res = await fetch("/api/public/pages/a-propos");
      if (!res.ok) return null;
      const data = (await res.json()) as {
        page?: { contenu?: unknown };
      };
      return data.page?.contenu ?? null;
    },
    staleTime: 60_000,
  });

  return useMemo(() => {
    const fallbackCms = {
      hero: {
        typeEtablissement: aPropos.hero.typeEtablissement,
        nom: CONTENU_A_PROPOS.hero.nom,
        badgeSlogan: aPropos.hero.badgeSlogan,
        suiteSlogan: aPropos.hero.suiteSlogan,
        descriptionCarte:
          "Centre de diagnostic et d'analyses médicales équipé pour répondre aux exigences les plus strictes en matière de fiabilité et d'accessibilité.",
        imagesFond: [],
      },
      mission: {
        titre: aPropos.mission.titre,
        texte: aPropos.mission.texte,
        imageUrl: undefined,
        images: [],
      },
      vision: {
        titre: aPropos.vision.titre,
        texte: aPropos.vision.texte,
      },
      valeurs: CONTENU_A_PROPOS.valeurs.map((valeur, index) => ({
        id: valeur.id,
        titre: aPropos.valeurs.items[index]?.titre ?? valeur.titre,
        description:
          aPropos.valeurs.items[index]?.description ?? valeur.description,
      })),
      histoire: {
        titre: aPropos.histoire.titre,
        paragraphes: [...aPropos.histoire.paragraphes],
      },
    };

    const cms = normaliserContenuAPropos(pageDb, fallbackCms);

    const membresBruts =
      gouvernanceDb?.services && gouvernanceDb.services.length > 0
        ? gouvernanceDb.services.flatMap((service) =>
            service.membres.map((membre) => ({
              id: membre.id,
              nom: membre.nom,
              fonction: membre.fonction,
              photoUrl: membre.photoUrl ?? "/images/equipe/personnel-1.png",
              bio: membre.bio,
              telephone: membre.telephone,
              email: membre.email,
              horaires: undefined as string | undefined,
              categorie: membre.categorie ?? "MEDECIN",
              salle: service.salle,
              masquerContactsPublic: membre.masquerContactsPublic ?? false,
              badges: [],
              ordre: membre.ordre ?? service.salle.ordre ?? 0,
            }))
          )
        : CONTENU_A_PROPOS.equipe.membres.map((membre, index) => ({
            id: membre.id,
            nom: aPropos.equipe.membres[index]?.nom ?? membre.nom,
            fonction:
              aPropos.equipe.membres[index]?.fonction ?? membre.fonction,
            photoUrl: membre.photoUrl,
            bio: undefined as string | undefined,
            telephone: undefined as string | undefined,
            email: undefined as string | undefined,
            horaires: undefined as string | undefined,
            categorie: "MEDECIN",
            salle: undefined,
            masquerContactsPublic: false,
            badges: [],
            ordre: index,
          }));

    const equipeSansDirection = membresBruts.filter((m) => m.categorie !== "ADMIN");
    const responsableCms = gouvernanceDb?.responsable ?? null;

    return {
      hero: cms.hero,
      mission: cms.mission,
      vision: cms.vision,
      valeurs: cms.valeurs,
      histoire: cms.histoire,
      direction: {
        titre: aPropos.direction.titre,
        sousTitre: aPropos.direction.sousTitre,
        responsable: {
          nom: responsableCms?.nom ?? aPropos.direction.responsable.nom,
          fonction: responsableCms?.fonction ?? aPropos.direction.responsable.fonction,
          biographie:
            responsableCms?.biographie ?? aPropos.direction.responsable.biographie,
          photoUrl:
            responsableCms?.photoUrl ?? CONTENU_A_PROPOS.direction.responsable.photoUrl,
          badges:
            responsableCms?.badges && responsableCms.badges.length > 0
              ? responsableCms.badges
              : [
                  { valeur: "OB", libelle: "Direction" },
                  { valeur: "ISO", libelle: "Qualité" },
                  { valeur: "RDC", libelle: "Kinshasa" },
                ],
        },
      },
      equipe: {
        titre: aPropos.equipe.titre,
        sousTitre: aPropos.equipe.sousTitre,
        membres: equipeSansDirection,
      },
      certifications: {
        titre: aPropos.certifications.titre,
        items: CONTENU_A_PROPOS.certifications.items.map((item, index) => ({
          id: item.id,
          titre: aPropos.certifications.items[index]?.titre ?? item.titre,
          description:
            aPropos.certifications.items[index]?.description ??
            item.description,
        })),
      },
      impact: {
        titre: aPropos.impact.titre,
        sousTitre: aPropos.impact.sousTitre,
        indicateurs: fusionnerIndicateursAvecStats(
          CONTENU_A_PROPOS.impact.indicateurs.map((indicateur, index) => ({
            id: indicateur.id,
            valeur: indicateur.valeur,
            libelle: aPropos.impact.items[index]?.libelle ?? indicateur.libelle,
            description:
              aPropos.impact.items[index]?.description ??
              indicateur.description,
          })),
          stats
        ),
      },
      bandeau: {
        slogan: aPropos.bandeau.slogan,
        siteWeb: CONTENU_A_PROPOS.bandeau.siteWeb,
        telephones: CONTENU_A_PROPOS.bandeau.telephones,
        telephone: aPropos.bandeau.telephone,
        siteWebLabel: aPropos.bandeau.siteWeb,
      },
      cta: {
        titre: aPropos.cta.titre,
        description: aPropos.cta.description,
        boutonPrincipal: {
          etiquette: aPropos.cta.boutonPrincipal,
          href: CONTENU_A_PROPOS.cta.boutonPrincipal.href,
        },
        boutonSecondaire: {
          etiquette: aPropos.cta.boutonSecondaire,
          href: CONTENU_A_PROPOS.cta.boutonSecondaire.href,
        },
        telephone: CONTENU_A_PROPOS.cta.telephone,
      },
    };
  }, [aPropos, gouvernanceDb, pageDb, stats]);
}

export function useContenuServicesLaboratoire() {
  const pages = usePages();
  const lab = pages.servicesLaboratoire;
  const imagesFond = useImagesFondHeroPage("services-laboratoire");

  return useMemo(
    () => ({
      hero: {
        surtitre: lab.hero.surtitre,
        titre: lab.hero.titre,
        titreAccent: lab.hero.titreAccent,
        description: lab.hero.description,
        imagesFond,
        garanties: CONTENU_SERVICES_LABORATOIRE.hero.garanties.map(
          (item, index) => ({
            id: item.id,
            titre: lab.hero.garanties[index]?.titre ?? item.titre,
            description:
              lab.hero.garanties[index]?.description ?? item.description,
          })
        ),
      },
      catalogue: {
        titreTous: lab.catalogue.titreTous,
        rechercheLabel: lab.catalogue.rechercheLabel,
        recherchePlaceholder: lab.catalogue.recherchePlaceholder,
        filtreCategorie: lab.catalogue.filtreCategorie,
        filtreService: lab.catalogue.filtreService,
        toutesCategories: lab.catalogue.toutesCategories,
        tousServices: lab.catalogue.tousServices,
        trierPar: lab.catalogue.trierPar,
        triNom: lab.catalogue.triNom,
        triPrixAsc: lab.catalogue.triPrixAsc,
        triPrixDesc: lab.catalogue.triPrixDesc,
        categoriesTitre: lab.catalogue.categoriesTitre,
        tousExamens: lab.catalogue.tousExamens,
        aideTitre: lab.catalogue.aideTitre,
        aideTexte: lab.catalogue.aideTexte,
        aucunResultat: lab.catalogue.aucunResultat,
      },
      cta: {
        titre: lab.cta.titre,
        description: lab.cta.description,
        boutonServices: lab.cta.boutonServices,
        boutonRdv: lab.cta.boutonRdv,
      },
    }),
    [lab, imagesFond]
  );
}
