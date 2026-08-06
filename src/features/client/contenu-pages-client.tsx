"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Loader2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface PagePublique {
  id: string;
  cle: string;
  titre: string;
  contenu: unknown;
  publie: boolean;
}

type BlocAPropos = {
  titrePage?: string;
  intro?: string;
  mission?: string;
  vision?: string;
  valeurs?: string;
};

function parserContenu(contenu: unknown): BlocAPropos {
  if (!contenu || typeof contenu !== "object") return {};
  const c = contenu as Record<string, unknown>;
  return {
    titrePage: typeof c.titrePage === "string" ? c.titrePage : undefined,
    intro: typeof c.intro === "string" ? c.intro : undefined,
    mission: typeof c.mission === "string" ? c.mission : undefined,
    vision: typeof c.vision === "string" ? c.vision : undefined,
    valeurs:
      typeof c.valeurs === "string"
        ? c.valeurs
        : Array.isArray(c.valeurs)
          ? (c.valeurs as string[]).join("\n")
          : undefined,
  };
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
  const [contenuTexte, setContenuTexte] = useState("{}");
  const [bloc, setBloc] = useState<BlocAPropos>({});
  const [publie, setPublie] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const estStructure = useMemo(
    () =>
      Boolean(
        selection &&
          (selection.cle === "a-propos" ||
            selection.cle.startsWith("a-propos") ||
            selection.cle === "accueil")
      ),
    [selection]
  );

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
    setContenuTexte(JSON.stringify(page.contenu ?? {}, null, 2));
    setBloc(parserContenu(page.contenu));
    setPublie(page.publie);
    setErreur(null);
  };

  const enregistrer = async () => {
    if (!selection) return;
    setEnCours(true);
    setErreur(null);
    try {
      let contenu: unknown;
      if (
        selection.cle === "a-propos" ||
        selection.cle.startsWith("a-propos") ||
        selection.cle === "accueil"
      ) {
        const valeurs = (bloc.valeurs ?? "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        contenu = {
          titrePage: bloc.titrePage ?? "",
          intro: bloc.intro ?? "",
          mission: bloc.mission ?? "",
          vision: bloc.vision ?? "",
          valeurs,
        };
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

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <ul className="space-y-1 rounded-xl border border-gris-bordure bg-white p-2 shadow-sm">
            {liste.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => ouvrirPage(p)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selection?.id === p.id
                      ? "bg-bleu-medical text-white"
                      : "text-texte-principal hover:bg-gris-tres-clair"
                  }`}
                >
                  <span className="font-medium">{p.titre}</span>
                  <span className="block text-[10px] opacity-80">{p.cle}</span>
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
            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("client.pages.titreChamp")}
                  </label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                  />
                </div>

                {estStructure ? (
                  <>
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>
                        Titre page
                      </label>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={bloc.titrePage ?? ""}
                        onChange={(e) =>
                          setBloc((b) => ({ ...b, titrePage: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>Intro</label>
                      <textarea
                        className={CLASSE_CHAMP_RECEPTION}
                        rows={3}
                        value={bloc.intro ?? ""}
                        onChange={(e) =>
                          setBloc((b) => ({ ...b, intro: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>Mission</label>
                      <textarea
                        className={CLASSE_CHAMP_RECEPTION}
                        rows={3}
                        value={bloc.mission ?? ""}
                        onChange={(e) =>
                          setBloc((b) => ({ ...b, mission: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>Vision</label>
                      <textarea
                        className={CLASSE_CHAMP_RECEPTION}
                        rows={3}
                        value={bloc.vision ?? ""}
                        onChange={(e) =>
                          setBloc((b) => ({ ...b, vision: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>
                        Valeurs (une par ligne)
                      </label>
                      <textarea
                        className={CLASSE_CHAMP_RECEPTION}
                        rows={4}
                        value={bloc.valeurs ?? ""}
                        onChange={(e) =>
                          setBloc((b) => ({ ...b, valeurs: e.target.value }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("client.pages.contenuJson")}
                    </label>
                    <textarea
                      className={`${CLASSE_CHAMP_RECEPTION} font-mono text-xs`}
                      rows={16}
                      value={contenuTexte}
                      onChange={(e) => setContenuTexte(e.target.value)}
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={publie}
                    onChange={(e) => setPublie(e.target.checked)}
                  />
                  {t("client.pages.publie")}
                </label>
              </div>
              <div className="mt-4">
                <Bouton variante="primaire" taille="petit" onClick={enregistrer} disabled={enCours}>
                  {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("client.common.enregistrer")}
                </Bouton>
              </div>
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
