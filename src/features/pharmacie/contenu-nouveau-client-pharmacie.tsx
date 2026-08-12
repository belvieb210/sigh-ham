"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, Save, SlidersHorizontal, UserPlus } from "lucide-react";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import {
  clientEnregistreCorrespondFiltres,
  compterFiltresClientsPharmacie,
  FILTRES_CLIENTS_PHARMACIE_VIDES,
  FormulaireFiltresClientsPharmacie,
  type FiltresClientsPharmacie,
} from "@/features/pharmacie/formulaire-filtres-clients-pharmacie";
import {
  PanneauDroitNouveauClientPharmacie,
  SectionsMobileNouveauClientPharmacie,
} from "@/features/pharmacie/panneau-droit-nouveau-client-pharmacie";
import type { ClientEnregistrePharmacie } from "@/lib/pharmacie/lister-clients-enregistres-pharmacie";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

function libelleSexe(sexe: string | null) {
  if (sexe === "FEMININ") return "F";
  if (sexe === "MASCULIN") return "M";
  return "—";
}

export function ContenuNouveauClientPharmacie({
  utilisateur,
}: {
  utilisateur: UtilisateurPharmacie;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const [clients, setClients] = useState<ClientEnregistrePharmacie[]>([]);
  const [chargementListe, setChargementListe] = useState(true);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresClientsPharmacie>(
    FILTRES_CLIENTS_PHARMACIE_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresClientsPharmacie>(
    FILTRES_CLIENTS_PHARMACIE_VIDES
  );
  const [clientSelectionne, setClientSelectionne] =
    useState<ClientEnregistrePharmacie | null>(null);

  const chargerListe = useCallback(async () => {
    setChargementListe(true);
    try {
      const res = await fetch("/api/pharmacie/clients?contexte=enregistres");
      const data = (await res.json()) as { clients?: ClientEnregistrePharmacie[] };
      if (res.ok) setClients(data.clients ?? []);
    } finally {
      setChargementListe(false);
    }
  }, []);

  useEffect(() => {
    void chargerListe();
  }, [chargerListe]);

  const clientsFiltres = useMemo(
    () => clients.filter((c) => clientEnregistreCorrespondFiltres(c, filtresAppliques)),
    [clients, filtresAppliques]
  );

  const nbFiltresActifs = compterFiltresClientsPharmacie(filtresAppliques);

  const enregistrer = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    setErreur(null);
    try {
      const res = await fetch("/api/pharmacie/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom,
          nom,
          age: age.trim() === "" ? null : age,
          sexe,
          adresse,
          telephone,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        dossierId?: string;
      };
      if (!res.ok) {
        setErreur(data.message ?? t("pharmacie.common.erreur"));
        return;
      }
      setMessage(data.message ?? t("pharmacie.nouveauClient.enregistre"));
      setPrenom("");
      setNom("");
      setAge("");
      setSexe("");
      setAdresse("");
      setTelephone("");
      await chargerListe();
      if (data.dossierId) {
        window.setTimeout(() => {
          router.push(
            `/sigh/pharmacie/vente?dossier=${encodeURIComponent(data.dossierId!)}`
          );
        }, 600);
      }
    } catch {
      setErreur(t("pharmacie.common.erreur"));
    } finally {
      setBusy(false);
    }
  }, [prenom, nom, age, sexe, adresse, telephone, router, t, chargerListe]);

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.nouveauClient.titre")}
      sousTitre={t("pharmacie.nouveauClient.sousTitre")}
      panneauDroit={<PanneauDroitNouveauClientPharmacie client={clientSelectionne} />}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-5">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-bleu-medical" />
          <h2 className="text-xl font-bold text-texte-principal">
            {t("pharmacie.nouveauClient.titre")}
          </h2>
        </div>

        {message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {erreur && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
        )}

        <section className="mx-auto max-w-3xl rounded-xl border border-gris-bordure bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t("pharmacie.nouveauClient.identite")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={CLASSE_LABEL_RECEPTION} htmlFor="nc-prenom">
                {t("pharmacie.vente.prenom")} *
              </label>
              <input
                id="nc-prenom"
                className={CLASSE_CHAMP_RECEPTION}
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION} htmlFor="nc-nom">
                {t("pharmacie.vente.nom")} *
              </label>
              <input
                id="nc-nom"
                className={CLASSE_CHAMP_RECEPTION}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                autoComplete="family-name"
              />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION} htmlFor="nc-age">
                {t("pharmacie.nouveauClient.age")}
              </label>
              <input
                id="nc-age"
                type="number"
                min={0}
                max={130}
                className={CLASSE_CHAMP_RECEPTION}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION} htmlFor="nc-sexe">
                {t("pharmacie.nouveauClient.sexe")}
              </label>
              <select
                id="nc-sexe"
                className={CLASSE_CHAMP_RECEPTION}
                value={sexe}
                onChange={(e) => setSexe(e.target.value)}
              >
                <option value="">{t("pharmacie.vente.choisir")}</option>
                <option value="MASCULIN">{t("pharmacie.nouveauClient.sexeM")}</option>
                <option value="FEMININ">{t("pharmacie.nouveauClient.sexeF")}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={CLASSE_LABEL_RECEPTION} htmlFor="nc-adresse">
                {t("pharmacie.nouveauClient.adresse")}
              </label>
              <input
                id="nc-adresse"
                className={CLASSE_CHAMP_RECEPTION}
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                autoComplete="street-address"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={CLASSE_LABEL_RECEPTION} htmlFor="nc-tel">
                {t("pharmacie.vente.telephone")}
              </label>
              <input
                id="nc-tel"
                type="tel"
                className={CLASSE_CHAMP_RECEPTION}
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !prenom.trim() || !nom.trim()}
              onClick={() => void enregistrer()}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg bg-bleu-medical px-4 py-2.5 text-sm font-semibold text-white",
                "hover:bg-bleu-medical/90 disabled:opacity-50"
              )}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("pharmacie.vente.enregistrerClient")}
            </button>
            <Link
              href="/sigh/pharmacie/vente"
              className="inline-flex items-center rounded-lg border border-gris-bordure px-4 py-2.5 text-sm font-semibold text-texte-principal hover:bg-gris-tres-clair"
            >
              {t("pharmacie.nouveauClient.allerVente")}
            </Link>
          </div>
        </section>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-texte-secondaire">
              {t("pharmacie.nouveauClient.listeAide")}
            </p>
            <button
              type="button"
              onClick={() => setFiltresOuverts((o) => !o)}
              aria-expanded={filtresOuverts}
              aria-label={
                filtresOuverts
                  ? t("caisse.facturation.fermerFiltres")
                  : t("caisse.facturation.ouvrirFiltres")
              }
              className={cn(
                "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors",
                filtresOuverts
                  ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                  : "border-gris-bordure bg-white hover:bg-gris-tres-clair"
              )}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span
                className={cn(
                  "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                  nbFiltresActifs > 0 ? "bg-red-500" : "bg-slate-400"
                )}
              >
                {nbFiltresActifs}
              </span>
            </button>
          </div>

          {filtresOuverts && (
            <FormulaireFiltresClientsPharmacie
              valeurs={brouillonFiltres}
              onChange={setBrouillonFiltres}
              onRechercher={() => {
                setFiltresAppliques(brouillonFiltres);
                setFiltresOuverts(false);
              }}
              onReinitialiser={() => {
                setBrouillonFiltres(FILTRES_CLIENTS_PHARMACIE_VIDES);
                setFiltresAppliques(FILTRES_CLIENTS_PHARMACIE_VIDES);
              }}
              idPrefix="filtre-nouveau-client-pharmacie"
            />
          )}

          <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="border-b border-gris-bordure px-4 py-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-texte-principal">
                {t("pharmacie.nouveauClient.listeTitre", { count: clientsFiltres.length })}
              </h3>
            </div>
            {chargementListe ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-texte-secondaire">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : clientsFiltres.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                {nbFiltresActifs > 0
                  ? t("caisse.facturation.filtres.aucunResultat")
                  : t("pharmacie.nouveauClient.listeVide")}
              </p>
            ) : (
              <div className="overflow-hidden">
                <table className="tableau-sigh">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                    <tr>
                      <th className="px-4 py-2.5">N°</th>
                      <th className="px-4 py-2.5">{t("pharmacie.vente.colPatient")}</th>
                      <th className="hidden px-4 py-2.5 sm:table-cell">
                        {t("pharmacie.nouveauClient.sexe")}
                      </th>
                      <th className="hidden px-4 py-2.5 md:table-cell">
                        {t("pharmacie.nouveauClient.age")}
                      </th>
                      <th className="hidden px-4 py-2.5 lg:table-cell">
                        {t("pharmacie.vente.telephone")}
                      </th>
                      <th className="px-4 py-2.5">{t("pharmacie.vente.dossier")}</th>
                      <th className="px-4 py-2.5">{t("pharmacie.vente.colHeure")}</th>
                      <th className="px-4 py-2.5">{t("pharmacie.vente.colActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsFiltres.map((c, index) => (
                      <tr
                        key={c.dossierId}
                        onClick={() => setClientSelectionne(c)}
                        className={cn(
                          "cursor-pointer border-t border-gris-bordure/70 hover:bg-slate-50",
                          clientSelectionne?.dossierId === c.dossierId &&
                            "bg-bleu-medical-clair/30"
                        )}
                      >
                        <td className="px-4 py-3 tabular-nums text-texte-secondaire">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold">{c.nomComplet}</td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          {libelleSexe(c.sexe)}
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          {c.age ?? "—"}
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">{c.telephone}</td>
                        <td className="px-4 py-3 font-mono text-xs">{c.numeroDossier}</td>
                        <td className="px-4 py-3 tabular-nums text-texte-secondaire">
                          {c.heure}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/sigh/pharmacie/vente?dossier=${encodeURIComponent(c.dossierId)}`}
                            className="rounded-lg border border-bleu-medical/30 px-3 py-1.5 text-xs font-semibold text-bleu-medical hover:bg-bleu-medical-clair/40"
                          >
                            {t("pharmacie.nouveauClient.ouvrirVente")}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <SectionsMobileNouveauClientPharmacie client={clientSelectionne} />
      </div>
    </MiseEnPagePharmacie>
  );
}
