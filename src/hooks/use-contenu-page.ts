"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CONTENU_A_PROPOS } from "@/constants/a-propos";
import {
  CAMPAGNES_PUBLICATIONS,
  CONTENU_CAMPAGNES,
} from "@/constants/campagnes";
import { CONTENU_CONTACT } from "@/constants/contact";
import { CONTENU_RENDEZ_VOUS } from "@/constants/rendez-vous";
import { CONTENU_SERVICES } from "@/constants/services";
import { useCampagnes } from "@/hooks/use-campagnes";
import type { PagesFr } from "@/locales/pages/fr";

function usePages(): PagesFr {
  const { i18n } = useTranslation();
  const langue = i18n.resolvedLanguage ?? i18n.language;

  return useMemo(() => {
    const bundle = i18n.getResourceBundle(langue, "translation");
    return (bundle?.pages ?? i18n.getResourceBundle("fr", "translation")?.pages) as PagesFr;
  }, [i18n, langue]);
}

export function useContenuContact() {
  const pages = usePages();
  const contact = pages.contact;

  return useMemo(
    () => ({
      hero: {
        surtitre: contact.hero.surtitre,
        titre: contact.hero.titre,
        titreAccent: contact.hero.titreAccent,
        description: contact.hero.description,
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
    [contact]
  );
}

export function useContenuRendezVous() {
  const pages = usePages();
  const rdv = pages.rendezVous;

  return useMemo(
    () => ({
      hero: {
        surtitre: rdv.hero.surtitre,
        titre: rdv.hero.titre,
        titreAccent: rdv.hero.titreAccent,
        description: rdv.hero.description,
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
    [rdv]
  );
}

export function useContenuServices() {
  const pages = usePages();
  const services = pages.services;
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
          categorie: string;
          points: string[];
          badge?: string;
          href?: string;
          icone: string;
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
        statistiques: [
          {
            valeur: CONTENU_SERVICES.hero.statistiques[0].valeur,
            libelle: services.hero.stats.analyses,
          },
          {
            valeur: CONTENU_SERVICES.hero.statistiques[1].valeur,
            libelle: services.hero.stats.delai,
          },
          {
            valeur: CONTENU_SERVICES.hero.statistiques[2].valeur,
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
              badge: s.badge ?? ("badge" in (base ?? {}) ? (base as { badge?: string }).badge : undefined),
              href: s.href ?? base?.href ?? `/services#${s.slug}`,
              imageUrl:
                s.imageUrl ??
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
        indicateurs: CONTENU_SERVICES.impact.indicateurs.map(
          (indicateur, index) => ({
            id: indicateur.id,
            valeur: indicateur.valeur,
            libelle:
              services.impact.items[index]?.libelle ?? indicateur.libelle,
            description:
              services.impact.items[index]?.description ??
              indicateur.description,
          })
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
    [services, servicesDb]
  );
}

export function useContenuCampagnes() {
  const pages = usePages();
  const campagnes = pages.campagnes;

  return useMemo(
    () => ({
      hero: {
        surtitre: campagnes.hero.surtitre,
        titre: campagnes.hero.titre,
        titreAccent: campagnes.hero.titreAccent,
        description: campagnes.hero.description,
        statistiques: [
          {
            valeur: CONTENU_CAMPAGNES.hero.statistiques[0].valeur,
            libelle: campagnes.hero.stats.sensibilises,
          },
          {
            valeur: CONTENU_CAMPAGNES.hero.statistiques[1].valeur,
            libelle: campagnes.hero.stats.actions,
          },
          {
            valeur: CONTENU_CAMPAGNES.hero.statistiques[2].valeur,
            libelle: campagnes.hero.stats.satisfaction,
          },
          {
            valeur: CONTENU_CAMPAGNES.hero.statistiques[3].valeur,
            libelle: campagnes.hero.stats.iso,
          },
        ],
      },
      grille: campagnes.grille,
      impact: {
        titre: campagnes.impact.titre,
        sousTitre: campagnes.impact.sousTitre,
        indicateurs: CONTENU_CAMPAGNES.impact.indicateurs.map(
          (indicateur, index) => ({
            id: indicateur.id,
            valeur: indicateur.valeur,
            libelle:
              campagnes.impact.items[index]?.libelle ?? indicateur.libelle,
            description:
              campagnes.impact.items[index]?.description ??
              indicateur.description,
          })
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
    }),
    [campagnes]
  );
}

export function useCampagnesTraduits() {
  const pages = usePages();
  const items = pages.campagnes.items;
  const { data: campagnesDb } = useCampagnes();

  return useMemo(() => {
    const source =
      campagnesDb && campagnesDb.length > 0
        ? campagnesDb
        : CAMPAGNES_PUBLICATIONS.filter((c) => c.publie);

    return source.map((campagne) => {
      const constMatch = CAMPAGNES_PUBLICATIONS.find(
        (c) => c.slug === campagne.slug
      );
      const trad = constMatch
        ? items[constMatch.id as keyof typeof items]
        : undefined;
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
  const { data: medecinsDb } = useQuery({
    queryKey: ["public", "medecins-vitrine"],
    queryFn: async () => {
      const res = await fetch("/api/public/medecins-vitrine");
      if (!res.ok) return null;
      const data = (await res.json()) as {
        medecins?: {
          id: string;
          nom: string;
          prenom: string;
          specialite: string;
          photoUrl?: string;
        }[];
      };
      return data.medecins ?? null;
    },
    staleTime: 60_000,
  });

  return useMemo(
    () => ({
      hero: {
        typeEtablissement: aPropos.hero.typeEtablissement,
        nom: CONTENU_A_PROPOS.hero.nom,
        badgeSlogan: aPropos.hero.badgeSlogan,
        suiteSlogan: aPropos.hero.suiteSlogan,
        imagesFond: CONTENU_A_PROPOS.hero.imagesFond,
      },
      mission: {
        titre: aPropos.mission.titre,
        texte: aPropos.mission.texte,
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
        paragraphes: aPropos.histoire.paragraphes,
      },
      direction: {
        titre: aPropos.direction.titre,
        sousTitre: aPropos.direction.sousTitre,
        responsable: {
          nom: aPropos.direction.responsable.nom,
          fonction: aPropos.direction.responsable.fonction,
          biographie: aPropos.direction.responsable.biographie,
          photoUrl: CONTENU_A_PROPOS.direction.responsable.photoUrl,
        },
      },
      equipe: {
        titre: aPropos.equipe.titre,
        sousTitre: aPropos.equipe.sousTitre,
        membres:
          medecinsDb && medecinsDb.length > 0
            ? medecinsDb.map((m) => ({
                id: m.id,
                nom: `${m.prenom} ${m.nom}`.trim(),
                fonction: m.specialite,
                photoUrl: m.photoUrl ?? "/images/equipe/personnel-1.png",
              }))
            : CONTENU_A_PROPOS.equipe.membres.map((membre, index) => ({
                id: membre.id,
                nom: aPropos.equipe.membres[index]?.nom ?? membre.nom,
                fonction:
                  aPropos.equipe.membres[index]?.fonction ?? membre.fonction,
                photoUrl: membre.photoUrl,
              })),
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
        indicateurs: CONTENU_A_PROPOS.impact.indicateurs.map(
          (indicateur, index) => ({
            id: indicateur.id,
            valeur: indicateur.valeur,
            libelle: aPropos.impact.items[index]?.libelle ?? indicateur.libelle,
            description:
              aPropos.impact.items[index]?.description ?? indicateur.description,
          })
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
    }),
    [aPropos, medecinsDb]
  );
}
