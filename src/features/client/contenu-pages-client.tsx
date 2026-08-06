"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import {
  ZoneImagesVitrine,
  type ImageVitrineItem,
} from "@/features/client/zone-images-vitrine";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import {
  normaliserContenuAPropos,
  type ContenuAProposNormalise,
  type ValeurAPropos,
} from "@/lib/client/normaliser-a-propos";
import { CONTENU_A_PROPOS } from "@/constants/a-propos";

interface PagePublique {
  id: string;
  cle: string;
  titre: string;
  contenu: unknown;
  publie: boolean;
}

type CtaBloc = {
  titre: string;
  description: string;
  telephone: string;
};

type ContactBloc = { note: string };

function fallbackAPropos(): ContenuAProposNormalise {
  return {
    hero: {
      typeEtablissement: CONTENU_A_PROPOS.hero.typeEtablissement,
      nom: CONTENU_A_PROPOS.hero.nom,
      badgeSlogan: CONTENU_A_PROPOS.hero.badgeSlogan,
      suiteSlogan: CONTENU_A_PROPOS.hero.suiteSlogan,
      descriptionCarte:
        "Centre de diagnostic et d'analyses médicales équipé pour répondre aux exigences les plus strictes en matière de fiabilité et d'accessibilité.",
      imagesFond: [],
    },
    mission: {
      titre: CONTENU_A_PROPOS.mission.titre,
      texte: CONTENU_A_PROPOS.mission.texte,
      images: [],
    },
    vision: {
      titre: CONTENU_A_PROPOS.vision.titre,
      texte: CONTENU_A_PROPOS.vision.texte,
    },
    valeurs: CONTENU_A_PROPOS.valeurs.map((v) => ({ ...v })),
    histoire: {
      titre: CONTENU_A_PROPOS.histoire.titre,
      paragraphes: [...CONTENU_A_PROPOS.histoire.paragraphes],
    },
  };
}

function parseCta(contenu: unknown): CtaBloc {
  const c =
    contenu && typeof contenu === "object"
      ? (contenu as Record<string, unknown>)
      : {};
  const cta =
    c.cta && typeof c.cta === "object"
      ? (c.cta as Record<string, unknown>)
      : c;
  return {
    titre: typeof cta.titre === "string" ? cta.titre : "",
    description: typeof cta.description === "string" ? cta.description : "",
    telephone: typeof cta.telephone === "string" ? cta.telephone : "",
  };
}

function parseContact(contenu: unknown): ContactBloc {
  const c =
    contenu && typeof contenu === "object"
      ? (contenu as Record<string, unknown>)
      : {};
  return {
    note:
      typeof c.note === "string"
        ? c.note
        : JSON.stringify(contenu ?? {}, null, 2),
  };
}

function Champ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={CLASSE_LABEL_RECEPTION}>{label}</label>
      {children}
    </div>
  );
}

function SectionCms({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-gris-bordure/80 bg-gris-tres-clair/40 p-4">
      <h3 className="text-sm font-bold text-[#2d2a6e]">{titre}</h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ContenuPagesClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<PagePublique[]>([]);
  const [selection, setSelection] = useState<PagePublique | null>(null);
  const [titre, setTitre] = useState("");
  const [publie, setPublie] = useState(true);
  const [aPropos, setAPropos] = useState<ContenuAProposNormalise>(fallbackAPropos());
  const [cta, setCta] = useState<CtaBloc>({
    titre: "",
    description: "",
    telephone: "",
  });
  const [contact, setContact] = useState<ContactBloc>({ note: "" });
  const [contenuTexte, setContenuTexte] = useState("{}");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const mode = useMemo(() => {
    if (!selection) return "none" as const;
    if (selection.cle === "a-propos") return "a-propos" as const;
    if (
      selection.cle === "services" ||
      selection.cle === "campagnes" ||
      selection.cle === "accueil"
    )
      return "cta" as const;
    if (selection.cle === "contact") return "contact" as const;
    return "json" as const;
  }, [selection]);

  const charger = useCallback(() => {
    fetch("/api/client/pages")
      .then(async (res) => {
        const data = (await res.json()) as {
          pages?: PagePublique[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        setListe(data.pages ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("client.common.erreur"))
      );
  }, [t]);

  useEffect(() => {
    charger();
  }, [charger]);

  const ouvrirPage = (page: PagePublique) => {
    setSelection(page);
    setTitre(page.titre);
    setPublie(page.publie);
    setErreur(null);
    setContenuTexte(JSON.stringify(page.contenu ?? {}, null, 2));
    setAPropos(normaliserContenuAPropos(page.contenu, fallbackAPropos()));
    setCta(parseCta(page.contenu));
    setContact(parseContact(page.contenu));
  };

  const enregistrer = async () => {
    if (!selection) return;
    setEnCours(true);
    setErreur(null);
    try {
      let contenu: unknown;
      if (mode === "a-propos") {
        contenu = aPropos;
      } else if (mode === "cta") {
        const base =
          selection.contenu && typeof selection.contenu === "object"
            ? { ...(selection.contenu as object) }
            : {};
        contenu = { ...base, cta };
      } else if (mode === "contact") {
        contenu = { note: contact.note };
      } else {
        try {
          contenu = JSON.parse(contenuTexte);
        } catch {
          throw new Error(t("client.pages.jsonInvalide"));
        }
      }
      const res = await fetch(`/api/client/pages/${selection.cle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre, contenu, publie }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const majValeur = (index: number, patch: Partial<ValeurAPropos>) => {
    setAPropos((prev) => ({
      ...prev,
      valeurs: prev.valeurs.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  };

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.pages.titre")}
      sousTitre={t("client.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <EnTetePageReception
          icone={FileText}
          titre={t("client.pages.titre")}
          description={t("client.pages.description")}
          fil={[
            { label: t("client.common.salle"), href: "/sigh/client" },
            { label: t("client.pages.fil") },
          ]}
        />

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <ul className="space-y-1 rounded-xl border border-gris-bordure bg-white p-2 shadow-sm">
            {liste.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => ouvrirPage(p)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selection?.id === p.id
                      ? "bg-bleu-medical text-white"
                      : "text-texte-principal hover:bg-gris-tres-clair"
                  }`}
                >
                  <span className="font-semibold">{p.titre}</span>
                  <span className="mt-0.5 block text-[10px] opacity-80">
                    {p.cle}
                  </span>
                </button>
              </li>
            ))}
            {liste.length === 0 ? (
              <li className="px-3 py-2 text-sm text-texte-secondaire">
                {t("client.pages.vide")}
              </li>
            ) : null}
          </ul>

          {selection ? (
            <div className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
              <Champ label={t("client.pages.titreChamp")}>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                />
              </Champ>

              {mode === "a-propos" ? (
                <>
                  <SectionCms titre={t("client.pages.sectionHero")}>
                    <Champ label={t("client.pages.typeEtablissement")}>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={aPropos.hero.typeEtablissement}
                        onChange={(e) =>
                          setAPropos((p) => ({
                            ...p,
                            hero: {
                              ...p.hero,
                              typeEtablissement: e.target.value,
                            },
                          }))
                        }
                      />
                    </Champ>
                    <Champ label={t("client.pages.nomEtablissement")}>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={aPropos.hero.nom}
                        onChange={(e) =>
                          setAPropos((p) => ({
                            ...p,
                            hero: { ...p.hero, nom: e.target.value },
                          }))
                        }
                      />
                    </Champ>
                    <Champ label={t("client.pages.badgeSlogan")}>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={aPropos.hero.badgeSlogan}
                        onChange={(e) =>
                          setAPropos((p) => ({
                            ...p,
                            hero: { ...p.hero, badgeSlogan: e.target.value },
                          }))
                        }
                      />
                    </Champ>
                    <Champ label={t("client.pages.suiteSlogan")}>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={aPropos.hero.suiteSlogan}
                        onChange={(e) =>
                          setAPropos((p) => ({
                            ...p,
                            hero: { ...p.hero, suiteSlogan: e.target.value },
                          }))
                        }
                      />
                    </Champ>
                    <div className="sm:col-span-2">
                      <Champ label={t("client.pages.descriptionCarte")}>
                        <textarea
                          className={CLASSE_CHAMP_RECEPTION}
                          rows={3}
                          value={aPropos.hero.descriptionCarte}
                          onChange={(e) =>
                            setAPropos((p) => ({
                              ...p,
                              hero: {
                                ...p.hero,
                                descriptionCarte: e.target.value,
                              },
                            }))
                          }
                        />
                      </Champ>
                    </div>
                    <div className="sm:col-span-2">
                      <ZoneImagesVitrine
                        label={t("client.pages.imagesFond")}
                        dossier="galerie"
                        images={aPropos.hero.imagesFond as ImageVitrineItem[]}
                        onChange={(images) =>
                          setAPropos((p) => ({
                            ...p,
                            hero: {
                              ...p.hero,
                              imagesFond: images.map((i) => ({
                                url: i.url,
                                alt: i.legende ?? "",
                              })),
                            },
                          }))
                        }
                        onErreur={setErreur}
                      />
                    </div>
                  </SectionCms>

                  <SectionCms titre={t("client.pages.sectionMission")}>
                    <Champ label={t("client.pages.missionTitre")}>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={aPropos.mission.titre}
                        onChange={(e) =>
                          setAPropos((p) => ({
                            ...p,
                            mission: { ...p.mission, titre: e.target.value },
                          }))
                        }
                      />
                    </Champ>
                    <div className="sm:col-span-2">
                      <Champ label={t("client.pages.missionTexte")}>
                        <textarea
                          className={CLASSE_CHAMP_RECEPTION}
                          rows={4}
                          value={aPropos.mission.texte}
                          onChange={(e) =>
                            setAPropos((p) => ({
                              ...p,
                              mission: { ...p.mission, texte: e.target.value },
                            }))
                          }
                        />
                      </Champ>
                    </div>
                    <div className="sm:col-span-2">
                      <ZoneImagesVitrine
                        label={t("client.pages.missionImage")}
                        dossier="galerie"
                        max={8}
                        images={
                          (aPropos.mission.images?.length
                            ? aPropos.mission.images
                            : aPropos.mission.imageUrl
                              ? [{ url: aPropos.mission.imageUrl }]
                              : []) as ImageVitrineItem[]
                        }
                        onChange={(images) =>
                          setAPropos((p) => ({
                            ...p,
                            mission: {
                              ...p.mission,
                              images: images.map((i) => ({
                                url: i.url,
                                alt: i.legende,
                              })),
                              imageUrl: images[0]?.url,
                            },
                          }))
                        }
                        onErreur={setErreur}
                      />
                    </div>
                  </SectionCms>

                  <SectionCms titre={t("client.pages.sectionVision")}>
                    <Champ label={t("client.pages.visionTitre")}>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={aPropos.vision.titre}
                        onChange={(e) =>
                          setAPropos((p) => ({
                            ...p,
                            vision: { ...p.vision, titre: e.target.value },
                          }))
                        }
                      />
                    </Champ>
                    <div className="sm:col-span-2">
                      <Champ label={t("client.pages.visionTexte")}>
                        <textarea
                          className={CLASSE_CHAMP_RECEPTION}
                          rows={4}
                          value={aPropos.vision.texte}
                          onChange={(e) =>
                            setAPropos((p) => ({
                              ...p,
                              vision: { ...p.vision, texte: e.target.value },
                            }))
                          }
                        />
                      </Champ>
                    </div>
                  </SectionCms>

                  <SectionCms titre={t("client.pages.sectionValeurs")}>
                    <div className="space-y-3 sm:col-span-2">
                      {aPropos.valeurs.map((v, index) => (
                        <div
                          key={v.id}
                          className="grid gap-2 rounded-lg border border-gris-bordure bg-white p-3 sm:grid-cols-[1fr_1fr_auto]"
                        >
                          <input
                            className={CLASSE_CHAMP_RECEPTION}
                            value={v.titre}
                            placeholder={t("client.pages.valeurTitre")}
                            onChange={(e) =>
                              majValeur(index, { titre: e.target.value })
                            }
                          />
                          <input
                            className={CLASSE_CHAMP_RECEPTION}
                            value={v.description}
                            placeholder={t("client.pages.valeurDescription")}
                            onChange={(e) =>
                              majValeur(index, { description: e.target.value })
                            }
                          />
                          <Bouton
                            type="button"
                            variante="danger"
                            taille="petit"
                            onClick={() =>
                              setAPropos((p) => ({
                                ...p,
                                valeurs: p.valeurs.filter((_, i) => i !== index),
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Bouton>
                        </div>
                      ))}
                      <Bouton
                        type="button"
                        variante="contour"
                        taille="petit"
                        onClick={() =>
                          setAPropos((p) => ({
                            ...p,
                            valeurs: [
                              ...p.valeurs,
                              {
                                id: `v-${Date.now()}`,
                                titre: "",
                                description: "",
                              },
                            ],
                          }))
                        }
                      >
                        <Plus className="h-4 w-4" />
                        {t("client.pages.ajouterValeur")}
                      </Bouton>
                    </div>
                  </SectionCms>

                  <SectionCms titre={t("client.pages.sectionHistoire")}>
                    <Champ label={t("client.pages.histoireTitre")}>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={aPropos.histoire.titre}
                        onChange={(e) =>
                          setAPropos((p) => ({
                            ...p,
                            histoire: { ...p.histoire, titre: e.target.value },
                          }))
                        }
                      />
                    </Champ>
                    <div className="sm:col-span-2">
                      <Champ label={t("client.pages.histoireParagraphes")}>
                        <textarea
                          className={CLASSE_CHAMP_RECEPTION}
                          rows={5}
                          value={aPropos.histoire.paragraphes.join("\n\n")}
                          onChange={(e) =>
                            setAPropos((p) => ({
                              ...p,
                              histoire: {
                                ...p.histoire,
                                paragraphes: e.target.value
                                  .split(/\n\n+/)
                                  .map((x) => x.trim())
                                  .filter(Boolean),
                              },
                            }))
                          }
                        />
                      </Champ>
                    </div>
                  </SectionCms>
                </>
              ) : null}

              {mode === "cta" ? (
                <SectionCms titre={t("client.pages.sectionCta")}>
                  <Champ label={t("client.pages.ctaTitre")}>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={cta.titre}
                      onChange={(e) =>
                        setCta((c) => ({ ...c, titre: e.target.value }))
                      }
                    />
                  </Champ>
                  <Champ label={t("client.pages.ctaTelephone")}>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={cta.telephone}
                      onChange={(e) =>
                        setCta((c) => ({ ...c, telephone: e.target.value }))
                      }
                    />
                  </Champ>
                  <div className="sm:col-span-2">
                    <Champ label={t("client.pages.ctaDescription")}>
                      <textarea
                        className={CLASSE_CHAMP_RECEPTION}
                        rows={4}
                        value={cta.description}
                        onChange={(e) =>
                          setCta((c) => ({ ...c, description: e.target.value }))
                        }
                      />
                    </Champ>
                  </div>
                </SectionCms>
              ) : null}

              {mode === "contact" ? (
                <SectionCms titre={t("client.pages.sectionContact")}>
                  <div className="sm:col-span-2">
                    <Champ label={t("client.pages.note")}>
                      <textarea
                        className={CLASSE_CHAMP_RECEPTION}
                        rows={6}
                        value={contact.note}
                        onChange={(e) => setContact({ note: e.target.value })}
                      />
                    </Champ>
                  </div>
                </SectionCms>
              ) : null}

              {mode === "json" ? (
                <Champ label={t("client.pages.contenuJson")}>
                  <textarea
                    className={`${CLASSE_CHAMP_RECEPTION} font-mono text-xs`}
                    rows={14}
                    value={contenuTexte}
                    onChange={(e) => setContenuTexte(e.target.value)}
                  />
                </Champ>
              ) : null}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={publie}
                  onChange={(e) => setPublie(e.target.checked)}
                />
                {t("client.pages.publie")}
              </label>

              <Bouton
                variante="primaire"
                taille="petit"
                onClick={enregistrer}
                disabled={enCours}
              >
                {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("client.common.enregistrer")}
              </Bouton>
            </div>
          ) : (
            <p className="text-sm text-texte-secondaire">
              {t("client.pages.selectionner")}
            </p>
          )}
        </div>
      </div>
    </MiseEnPageClient>
  );
}
