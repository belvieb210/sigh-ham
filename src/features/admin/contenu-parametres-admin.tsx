"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Loader2,
  Megaphone,
  Phone,
  Save,
  Settings,
  Shield,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { CHEMIN_LOGO_HAM } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface ParametreItem {
  cle: string;
  valeur: string;
  categorie: string;
  description: string | null;
}

const CLES_BRANDING = [
  "etablissement.nom",
  "etablissement.nomCourt",
  "etablissement.nomComplet",
  "etablissement.slogan",
  "etablissement.telephone",
  "etablissement.email",
  "etablissement.adresse",
] as const;

function CarteSection({
  icone: Icone,
  titre,
  aide,
  children,
}: {
  icone: typeof Building2;
  titre: string;
  aide: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-gris-bordure bg-slate-50/70 px-5 py-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bleu-medical-clair text-bleu-medical">
          <Icone className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-texte-principal">{titre}</h3>
          <p className="mt-0.5 text-xs text-texte-secondaire">{aide}</p>
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function ChampParametre({
  id,
  label,
  aide,
  children,
  className,
}: {
  id: string;
  label: string;
  aide?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={CLASSE_LABEL_RECEPTION}>
        {label}
      </label>
      {aide ? (
        <p className="mb-1.5 text-xs text-texte-secondaire">{aide}</p>
      ) : null}
      {children}
    </div>
  );
}

export function ContenuParametresAdmin({
  utilisateur,
  categorie = "branding",
}: {
  utilisateur: UtilisateurAdmin;
  categorie?: "branding" | "securite";
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ParametreItem[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const titre =
    categorie === "securite"
      ? t("admin.securite.titre")
      : t("admin.parametres.titre");
  const description =
    categorie === "securite"
      ? t("admin.securite.description")
      : t("admin.parametres.description");

  const charger = useCallback(() => {
    fetch(`/api/admin/parametres?categorie=${categorie}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          parametres?: ParametreItem[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        const recus = data.parametres ?? [];
        if (categorie === "branding") {
          const map = new Map(recus.map((p) => [p.cle, p]));
          setItems(
            CLES_BRANDING.map(
              (cle) =>
                map.get(cle) ?? {
                  cle,
                  valeur: "",
                  categorie: "branding",
                  description: null,
                }
            )
          );
        } else {
          setItems(recus);
        }
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"))
      );
  }, [categorie, t]);

  useEffect(() => {
    charger();
  }, [charger]);

  const parCle = useMemo(() => {
    const map = new Map(items.map((p) => [p.cle, p]));
    return map;
  }, [items]);

  const lire = (cle: string) => parCle.get(cle)?.valeur ?? "";

  const maj = (cle: string, valeur: string) => {
    setItems((liste) => {
      const idx = liste.findIndex((p) => p.cle === cle);
      if (idx === -1) {
        return [
          ...liste,
          { cle, valeur, categorie, description: null },
        ];
      }
      const next = [...liste];
      next[idx] = { ...next[idx], valeur };
      return next;
    });
  };

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/parametres", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parametres: items.map((p) => ({
            cle: p.cle,
            valeur: p.valeur,
            categorie: p.categorie,
            description: p.description ?? undefined,
          })),
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.parametres.succes"));
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const boutonsEnregistrer = (
    <Bouton
      type="button"
      className="w-full"
      onClick={() => void enregistrer()}
      disabled={enCours || items.length === 0}
    >
      {enCours ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {t("admin.parametres.enregistrer")}
    </Bouton>
  );

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={titre}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <EnTetePageReception
          icone={Settings}
          titre={titre}
          description={description}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: titre },
          ]}
        />

        {message ? (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        ) : null}
        {erreur ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        {categorie === "branding" ? (
          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <CarteSection
                icone={Building2}
                titre={t("admin.parametres.identite")}
                aide={t("admin.parametres.identiteAide")}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <ChampParametre
                    id="param-nom"
                    label={t("admin.parametres.champs.nom")}
                    aide={t("admin.parametres.champs.nomAide")}
                  >
                    <input
                      id="param-nom"
                      className={CLASSE_CHAMP_RECEPTION}
                      value={lire("etablissement.nom")}
                      onChange={(e) => maj("etablissement.nom", e.target.value)}
                    />
                  </ChampParametre>
                  <ChampParametre
                    id="param-nom-court"
                    label={t("admin.parametres.champs.nomCourt")}
                    aide={t("admin.parametres.champs.nomCourtAide")}
                  >
                    <input
                      id="param-nom-court"
                      className={CLASSE_CHAMP_RECEPTION}
                      value={lire("etablissement.nomCourt")}
                      onChange={(e) => maj("etablissement.nomCourt", e.target.value)}
                    />
                  </ChampParametre>
                </div>
                <ChampParametre
                  id="param-nom-complet"
                  label={t("admin.parametres.champs.nomComplet")}
                  aide={t("admin.parametres.champs.nomCompletAide")}
                >
                  <input
                    id="param-nom-complet"
                    className={CLASSE_CHAMP_RECEPTION}
                    value={lire("etablissement.nomComplet")}
                    onChange={(e) => maj("etablissement.nomComplet", e.target.value)}
                  />
                </ChampParametre>
              </CarteSection>

              <CarteSection
                icone={Phone}
                titre={t("admin.parametres.contact")}
                aide={t("admin.parametres.contactAide")}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <ChampParametre
                    id="param-tel"
                    label={t("admin.parametres.champs.telephone")}
                  >
                    <input
                      id="param-tel"
                      type="tel"
                      className={CLASSE_CHAMP_RECEPTION}
                      value={lire("etablissement.telephone")}
                      onChange={(e) =>
                        maj("etablissement.telephone", e.target.value)
                      }
                    />
                  </ChampParametre>
                  <ChampParametre
                    id="param-email"
                    label={t("admin.parametres.champs.email")}
                  >
                    <input
                      id="param-email"
                      type="email"
                      className={CLASSE_CHAMP_RECEPTION}
                      value={lire("etablissement.email")}
                      onChange={(e) => maj("etablissement.email", e.target.value)}
                    />
                  </ChampParametre>
                </div>
                <ChampParametre
                  id="param-adresse"
                  label={t("admin.parametres.champs.adresse")}
                >
                  <textarea
                    id="param-adresse"
                    rows={3}
                    className={CLASSE_CHAMP_RECEPTION}
                    value={lire("etablissement.adresse")}
                    onChange={(e) => maj("etablissement.adresse", e.target.value)}
                  />
                </ChampParametre>
              </CarteSection>

              <CarteSection
                icone={Megaphone}
                titre={t("admin.parametres.communication")}
                aide={t("admin.parametres.communicationAide")}
              >
                <ChampParametre
                  id="param-slogan"
                  label={t("admin.parametres.champs.slogan")}
                >
                  <textarea
                    id="param-slogan"
                    rows={3}
                    className={CLASSE_CHAMP_RECEPTION}
                    value={lire("etablissement.slogan")}
                    onChange={(e) => maj("etablissement.slogan", e.target.value)}
                  />
                </ChampParametre>
              </CarteSection>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-4">
              <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                <div className="border-b border-gris-bordure px-5 py-3">
                  <h3 className="text-sm font-bold text-texte-principal">
                    {t("admin.parametres.apercu")}
                  </h3>
                  <p className="mt-0.5 text-xs text-texte-secondaire">
                    {t("admin.parametres.apercuAide")}
                  </p>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={CHEMIN_LOGO_HAM}
                      alt=""
                      className="h-12 w-12 rounded-lg border border-gris-bordure object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-texte-principal">
                        {lire("etablissement.nom") || "—"}
                      </p>
                      <p className="truncate text-xs text-texte-secondaire">
                        {lire("etablissement.nomCourt") || "—"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-texte-secondaire">
                    {lire("etablissement.nomComplet") || "—"}
                  </p>
                  <p className="rounded-lg bg-bleu-medical-clair/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-bleu-medical">
                    {lire("etablissement.slogan") || "—"}
                  </p>
                  <div className="space-y-1 text-xs text-texte-secondaire">
                    <p>{lire("etablissement.telephone") || "—"}</p>
                    <p>{lire("etablissement.email") || "—"}</p>
                    <p>{lire("etablissement.adresse") || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                {boutonsEnregistrer}
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <CarteSection
              icone={Shield}
              titre={t("admin.parametres.politique")}
              aide={t("admin.parametres.politiqueAide")}
            >
              {items.length === 0 ? (
                <p className="text-sm text-texte-secondaire">
                  {t("admin.common.chargement")}
                </p>
              ) : (
                items.map((p) => {
                  const booleen =
                    p.valeur === "true" || p.valeur === "false";
                  const estMdp = p.cle.includes("MotDePasse") || p.cle.includes("mdp");
                  const estSession = p.cle.includes("session");
                  return (
                    <div key={p.cle}>
                      {booleen ? (
                        <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-gris-bordure px-4 py-3">
                          <span>
                            <span className="block text-sm font-semibold text-texte-principal">
                              {estMdp
                                ? t("admin.parametres.champs.mdpFort")
                                : p.description || p.cle}
                            </span>
                            <span className="mt-0.5 block text-xs text-texte-secondaire">
                              {estMdp
                                ? t("admin.parametres.champs.mdpFortAide")
                                : p.cle}
                            </span>
                          </span>
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-bleu-medical"
                            checked={p.valeur === "true"}
                            onChange={(e) =>
                              maj(p.cle, e.target.checked ? "true" : "false")
                            }
                          />
                        </label>
                      ) : (
                        <ChampParametre
                          id={`param-${p.cle}`}
                          label={
                            estSession
                              ? t("admin.parametres.champs.sessionDuree")
                              : p.description || p.cle
                          }
                          aide={
                            estSession
                              ? t("admin.parametres.champs.sessionDureeAide")
                              : undefined
                          }
                        >
                          <input
                            id={`param-${p.cle}`}
                            className={CLASSE_CHAMP_RECEPTION}
                            value={p.valeur}
                            onChange={(e) => maj(p.cle, e.target.value)}
                          />
                        </ChampParametre>
                      )}
                    </div>
                  );
                })
              )}
              <div className="pt-2">{boutonsEnregistrer}</div>
            </CarteSection>
            <SectionSessionsActives />
          </div>
        )}
      </div>
    </MiseEnPageAdmin>
  );
}

function SectionSessionsActives() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<
    {
      id: string;
      utilisateurId: string;
      ipAddress: string | null;
      createdAt: string;
      expireLe: string;
      utilisateur: {
        identifiant: string;
        prenom: string;
        nom: string;
        role: { code: string; nom: string };
      };
    }[]
  >([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = () => {
    fetch("/api/admin/sessions")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setSessions(data.sessions ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"))
      );
  };

  useEffect(() => {
    charger();
  }, []);

  const revoquer = async (sessionId: string) => {
    setEnCours(sessionId);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
      <div className="border-b border-gris-bordure bg-slate-50/70 px-5 py-4">
        <h3 className="text-sm font-bold text-texte-principal">
          {t("admin.securite.sessionsTitre")}
        </h3>
        <p className="mt-0.5 text-xs text-texte-secondaire">
          {t("admin.securite.sessionsDesc")}
        </p>
      </div>
      {erreur ? (
        <p className="px-5 pt-3 text-sm text-red-700">{erreur}</p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="tableau-sigh">
          <thead className="text-xs uppercase text-texte-secondaire">
            <tr>
              <th className="px-5 py-2">{t("admin.securite.colonneUser")}</th>
              <th className="px-3 py-2">IP</th>
              <th className="px-3 py-2">{t("admin.securite.colonneExpire")}</th>
              <th className="px-5 py-2" />
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-gris-bordure">
                <td className="px-5 py-2.5">
                  {s.utilisateur.prenom} {s.utilisateur.nom}
                  <span className="block text-xs text-texte-secondaire">
                    {s.utilisateur.identifiant} · {s.utilisateur.role.code}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-xs">{s.ipAddress || "—"}</td>
                <td className="px-3 py-2.5 text-xs">
                  {new Date(s.expireLe).toLocaleString()}
                </td>
                <td className="px-5 py-2.5 text-right">
                  <Bouton
                    type="button"
                    variante="danger"
                    taille="petit"
                    disabled={enCours === s.id}
                    onClick={() => void revoquer(s.id)}
                  >
                    {t("admin.securite.revoquer")}
                  </Bouton>
                </td>
              </tr>
            ))}
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-texte-secondaire">
                  {t("admin.securite.sessionsVide")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
