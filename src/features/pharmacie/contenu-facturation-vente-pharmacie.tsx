"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Check,
  Loader2,
  Pill,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import {
  MODES_FACTURE_CAISSE,
  MODES_PAIEMENT_UI_CAISSE,
} from "@/constants/caisse";
import {
  compterFiltresActifs,
  FILTRES_FACTURATION_VIDES,
  FormulaireFiltresFacturationCaisse,
  type FiltresFacturationCaisse,
} from "@/features/caisse/formulaire-filtres-facturation-caisse";
import {
  arrondirMontantCaisse,
  formaterMontantCaisse,
  initiales,
} from "@/features/caisse/utils-format";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import { RechercheAjoutMedicamentPharmacie } from "@/features/pharmacie/recherche-ajout-medicament-pharmacie";
import {
  clientVenteCorrespondFiltres,
  type FiltreSourceVentePharmacie,
} from "@/features/pharmacie/filtres-vente-pharmacie";
import type { ClientVentePharmacie } from "@/lib/pharmacie/lister-clients-vente-pharmacie";
import type { DossierVentePharmacie } from "@/lib/pharmacie/obtenir-dossier-vente-pharmacie";
import type { MedicamentResume } from "@/lib/pharmacie/types";
import { ChampDateNaissance } from "@/features/reception/champ-date-naissance";
import { cn } from "@/lib/utils";
import type { ModeFactureCaisse } from "@/lib/caisse/types";

interface LignePanier {
  cle: string;
  medicamentId: string;
  libelle: string;
  quantite: number;
  prixUnitaire: number;
}

type ModeUi = (typeof MODES_PAIEMENT_UI_CAISSE)[number]["id"];

function libelleSexe(sexe: string | null) {
  if (sexe === "FEMININ") return "Féminin";
  if (sexe === "MASCULIN") return "Masculin";
  return sexe ?? "—";
}

export function ContenuFacturationVentePharmacie({
  utilisateur,
}: {
  utilisateur: UtilisateurPharmacie;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dossierInitial = searchParams.get("dossier");

  const [clients, setClients] = useState<ClientVentePharmacie[]>([]);
  const [dossierId, setDossierId] = useState<string | null>(dossierInitial);
  const [dossier, setDossier] = useState<DossierVentePharmacie | null>(null);
  const [lignes, setLignes] = useState<LignePanier[]>([]);
  const [chargementClients, setChargementClients] = useState(true);
  const [chargementDossier, setChargementDossier] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const [ongletMobile, setOngletMobile] = useState<"medicaments" | "resume">("medicaments");

  const [modeFacture, setModeFacture] = useState<ModeFactureCaisse>("CASH");
  const [modeUi, setModeUi] = useState<ModeUi>("ESPECES");
  const [remise, setRemise] = useState(0);
  const [fraisDivers, setFraisDivers] = useState(0);
  const [montantPaiement, setMontantPaiement] = useState(0);
  const [montantAvance, setMontantAvance] = useState(0);
  const [devise, setDevise] = useState("CDF");
  const [notes, setNotes] = useState("");
  const [datePaiement, setDatePaiement] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [numeroRecu, setNumeroRecu] = useState("");

  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState(FILTRES_FACTURATION_VIDES);
  const [filtresAppliques, setFiltresAppliques] = useState(FILTRES_FACTURATION_VIDES);
  const [filtreSource, setFiltreSource] = useState<FiltreSourceVentePharmacie>("TOUS");

  const chargerClients = useCallback(async () => {
    setChargementClients(true);
    try {
      const res = await fetch("/api/pharmacie/clients");
      const data = (await res.json()) as { clients?: ClientVentePharmacie[] };
      if (res.ok) setClients(data.clients ?? []);
    } finally {
      setChargementClients(false);
    }
  }, []);

  const chargerDossier = useCallback(
    async (id: string) => {
      setChargementDossier(true);
      setErreur(null);
      setRechercheOuverte(false);
      try {
        const res = await fetch(
          `/api/pharmacie/vente/dossier?dossierId=${encodeURIComponent(id)}`
        );
        const data = (await res.json()) as {
          dossier?: DossierVentePharmacie;
          erreur?: string;
        };
        if (!res.ok || !data.dossier) {
          throw new Error(data.erreur ?? t("pharmacie.common.erreur"));
        }
        if (
          data.dossier.venteStatut === "PAYEE" ||
          data.dossier.venteStatut === "DELIVREE"
        ) {
          router.replace(
            `/sigh/pharmacie/paiements-valides?dossier=${encodeURIComponent(id)}`
          );
          return;
        }
        setDossier(data.dossier);
        setLignes(
          data.dossier.lignesOrdonnance.map((l) => ({
            cle: l.id,
            medicamentId: l.medicamentId,
            libelle: l.libelle,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
          }))
        );
        setNumeroRecu(`REC-PH-${Date.now().toString(36).toUpperCase()}`);
      } catch (e) {
        setErreur(e instanceof Error ? e.message : t("pharmacie.common.erreur"));
      } finally {
        setChargementDossier(false);
      }
    },
    [t, router]
  );

  useEffect(() => {
    void chargerClients();
  }, [chargerClients]);

  useEffect(() => {
    if (dossierInitial) {
      setDossierId(dossierInitial);
    }
  }, [dossierInitial]);

  useEffect(() => {
    if (dossierId) void chargerDossier(dossierId);
    else {
      setDossier(null);
      setLignes([]);
    }
  }, [dossierId, chargerDossier]);

  const clientsFiltres = useMemo(
    () =>
      clients.filter((c) =>
        clientVenteCorrespondFiltres(c, filtresAppliques, filtreSource)
      ),
    [clients, filtresAppliques, filtreSource]
  );

  const nbFiltresActifs =
    compterFiltresActifs(filtresAppliques, { ignorerNumeroFacture: true }) +
    (filtreSource !== "TOUS" ? 1 : 0);

  const totalMedicaments = useMemo(
    () =>
      arrondirMontantCaisse(
        lignes.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0)
      ),
    [lignes]
  );

  const sousTotal = arrondirMontantCaisse(
    Math.max(0, totalMedicaments - remise) + fraisDivers
  );
  const montantDuJour = sousTotal;
  const montantPayeUi =
    modeFacture === "AVANCE" ? montantAvance : montantPaiement;
  const resteApres = arrondirMontantCaisse(Math.max(0, montantDuJour - montantPayeUi));

  useEffect(() => {
    setMontantPaiement(montantDuJour);
  }, [montantDuJour]);

  const idsPresents = useMemo(
    () => new Set(lignes.map((l) => l.medicamentId).filter(Boolean)),
    [lignes]
  );

  function selectionnerClient(c: ClientVentePharmacie) {
    setDossierId(c.dossierId);
    router.push(`/sigh/pharmacie/vente?dossier=${encodeURIComponent(c.dossierId)}`);
  }

  function retourListe() {
    setDossierId(null);
    setDossier(null);
    setLignes([]);
    router.push("/sigh/pharmacie/vente");
  }

  function ajouterMedicament(m: MedicamentResume) {
    setLignes((prev) => {
      const existant = prev.find((l) => l.medicamentId === m.id);
      if (existant) {
        return prev.map((l) =>
          l.medicamentId === m.id ? { ...l, quantite: l.quantite + 1 } : l
        );
      }
      return [
        ...prev,
        {
          cle: `m-${m.id}-${Date.now()}`,
          medicamentId: m.id,
          libelle: `${m.nom}${m.dosage ? ` ${m.dosage}` : ""}`,
          quantite: 1,
          prixUnitaire: m.prixUnitaire,
        },
      ];
    });
    setRechercheOuverte(false);
  }

  function retirerLigne(cle: string) {
    setLignes((prev) => prev.filter((l) => l.cle !== cle));
  }

  async function transmettre() {
    if (!dossierId || lignes.length === 0) {
      setErreur(t("pharmacie.vente.besoinLignes"));
      return;
    }
    if (dossier?.venteStatut === "TRANSMISE" || dossier?.venteStatut === "PAYEE") {
      setErreur(
        t("pharmacie.vente.dejaTransmise", {
          numero: dossier.numeroFacture ?? "—",
        })
      );
      return;
    }
    const lignesInvalides = lignes.filter((l) => !l.medicamentId?.trim());
    if (lignesInvalides.length > 0) {
      setErreur(t("pharmacie.vente.ligneMedicamentInvalide"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/pharmacie/ventes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "creerEtTransmettre",
          dossierId,
          notes: notes.trim() || undefined,
          lignes: lignes.map((l) => ({
            medicamentId: l.medicamentId,
            quantite: l.quantite,
            remise: 0,
          })),
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        facture?: { numeroFacture?: string };
      };
      if (!res.ok) throw new Error(data.message ?? t("pharmacie.common.erreur"));

      setMessage(
        data.message ??
          t("pharmacie.vente.transmiseFacture", {
            numero: data.facture?.numeroFacture ?? "—",
          })
      );

      retourListe();
      await chargerClients();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("pharmacie.common.erreur"));
    } finally {
      setEnCours(false);
    }
  }

  const venteDejaTransmise =
    dossier?.venteStatut === "TRANSMISE" || dossier?.venteStatut === "PAYEE";

  const resumePanel = dossier && (
    <section className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("caisse.facturation.resumeFacture")}
      </h3>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-texte-secondaire">
            {t("caisse.facturation.totalMedicaments")}
          </span>
          <span className="font-medium">
            {formaterMontantCaisse(totalMedicaments, devise)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="remise-ph" className="text-texte-secondaire">
            {t("caisse.facturation.remise")}
          </label>
          <input
            id="remise-ph"
            type="number"
            min={0}
            step="0.01"
            max={totalMedicaments}
            value={remise}
            onChange={(e) =>
              setRemise(
                arrondirMontantCaisse(
                  Math.min(totalMedicaments, Number(e.target.value) || 0)
                )
              )
            }
            className="w-24 rounded-lg border border-gris-bordure px-2 py-1.5 text-right text-sm"
          />
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-texte-secondaire">{t("caisse.facturation.sousTotal")}</span>
          <span className="font-medium">{formaterMontantCaisse(sousTotal, devise)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="frais-ph" className="text-texte-secondaire">
            {t("caisse.facturation.fraisDivers")}
          </label>
          <input
            id="frais-ph"
            type="number"
            min={0}
            step="0.01"
            value={fraisDivers}
            onChange={(e) =>
              setFraisDivers(arrondirMontantCaisse(Number(e.target.value) || 0))
            }
            className="w-24 rounded-lg border border-gris-bordure px-2 py-1.5 text-right text-sm"
          />
        </div>
        <div className="border-t border-gris-bordure pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-texte-secondaire">
            {t("caisse.facturation.totalAPayer")}
          </p>
          <p className="mt-1 text-2xl font-bold text-bleu-medical">
            {formaterMontantCaisse(montantDuJour, devise)}
          </p>
        </div>
        <div className="flex justify-between gap-3 pt-1">
          <span className="text-texte-secondaire">{t("caisse.facturation.montantPaye")}</span>
          <span className="font-medium">
            {formaterMontantCaisse(montantPayeUi, devise)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-texte-secondaire">{t("caisse.facturation.resteAPayer")}</span>
          <span
            className={cn(
              "font-bold",
              resteApres <= 0 ? "text-emerald-600" : "text-amber-700"
            )}
          >
            {formaterMontantCaisse(resteApres, devise)}
          </span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.facturation.moyensPaiement")}
        </p>
        <div className="space-y-1.5">
          {MODES_PAIEMENT_UI_CAISSE.map((mode) => (
            <label
              key={mode.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                modeUi === mode.id
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : "border-gris-bordure hover:bg-gris-tres-clair"
              )}
            >
              <input
                type="radio"
                name="modePaiementPh"
                checked={modeUi === mode.id}
                onChange={() => setModeUi(mode.id)}
                className="sr-only"
              />
              {t(`caisse.modesPaiement.${mode.id}`)}
            </label>
          ))}
        </div>
      </div>

      <section className="rounded-xl border border-gris-bordure bg-[#f8fafc] p-3">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.facturation.typeFacture")}
        </h3>
        <div className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-bleu-medical bg-bleu-medical-clair p-3 text-center text-xs font-medium">
          <Pill className="h-6 w-6 text-bleu-medical" />
          {t("caisse.facturation.facturePharmacie")}
        </div>
        <p className="mt-2 text-[11px] text-texte-secondaire">
          {t("pharmacie.vente.aideTypeFacture")}
        </p>
      </section>

      <button
        type="button"
        disabled={enCours || lignes.length === 0 || venteDejaTransmise}
        onClick={() => void transmettre()}
        className="w-full rounded-lg bg-bleu-medical py-3 text-sm font-bold text-white hover:bg-bleu-medical/90 disabled:opacity-50"
      >
        {enCours ? (
          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
        ) : venteDejaTransmise ? (
          t("pharmacie.vente.dejaTransmiseBouton")
        ) : (
          t("pharmacie.vente.creerTransmettre")
        )}
      </button>
      {venteDejaTransmise && dossier?.numeroFacture && (
        <p className="text-center text-xs text-emerald-700">
          {t("pharmacie.vente.factureExistante", { numero: dossier.numeroFacture })}
        </p>
      )}
    </section>
  );

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.vente.titre")}
      sousTitre={t("pharmacie.vente.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-4">
        {message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {erreur && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
        )}

        {dossierId && (
          <Link
            href="/sigh/pharmacie/vente"
            onClick={(e) => {
              e.preventDefault();
              retourListe();
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-bleu-medical hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("caisse.facturation.retourListe")}
          </Link>
        )}

        {dossierId &&
          (chargementDossier || !dossier ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16">
            <Loader2 className="h-5 w-5 animate-spin text-texte-secondaire" />
          </div>
        ) : (
          <>
            <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bleu-medical text-base font-bold text-white">
                  {initiales(dossier.prenom, dossier.nom)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-texte-principal">
                    {dossier.prenom} {dossier.nom}
                  </h2>
                  <p className="mt-1 text-sm text-texte-secondaire">
                    {dossier.numeroDossier} |{" "}
                    {dossier.age != null
                      ? t("caisse.facturation.age", { age: dossier.age })
                      : "—"}{" "}
                    | {libelleSexe(dossier.sexe)}
                    {dossier.telephone ? ` | ${dossier.telephone}` : ""}
                  </p>
                  {dossier.adresse && (
                    <p className="mt-1 text-xs text-texte-secondaire">{dossier.adresse}</p>
                  )}
                </div>
              </div>
            </section>

            <div className="flex gap-1 rounded-lg bg-gris-tres-clair p-1 lg:hidden">
              {(["medicaments", "resume"] as const).map((onglet) => (
                <button
                  key={onglet}
                  type="button"
                  onClick={() => setOngletMobile(onglet)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-sm font-semibold",
                    ongletMobile === onglet
                      ? "bg-white text-bleu-medical shadow-sm"
                      : "text-texte-secondaire"
                  )}
                >
                  {onglet === "medicaments"
                    ? t("pharmacie.vente.panier")
                    : t("caisse.facturation.ongletResume")}
                </button>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div
                className={cn(
                  "space-y-4",
                  ongletMobile !== "medicaments" && "hidden lg:block"
                )}
              >
                <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                  <div className="border-b border-gris-bordure px-2 py-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                      {t("pharmacie.vente.medicamentsPrescrits")}
                    </h3>
                  </div>
                  {lignes.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                      {t("pharmacie.vente.aucuneLigne")}
                    </p>
                  ) : (
                    <div className="conteneur-tableau-sigh">
        <table className="tableau-sigh">
                        <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                          <tr>
                            <th className="px-3 py-2.5">N°</th>
                            <th className="px-3 py-2.5">{t("pharmacie.vente.medicament")}</th>
                            <th className="px-3 py-2.5 text-right">
                              {t("caisse.facturation.prixUnit")}
                            </th>
                            <th className="px-3 py-2.5 text-center">{t("pharmacie.vente.qte")}</th>
                            <th className="px-3 py-2.5 text-right">
                              {t("caisse.facturation.montant")}
                            </th>
                            <th className="px-3 py-2.5" />
                          </tr>
                        </thead>
                        <tbody>
                          {lignes.map((l, i) => (
                            <tr key={l.cle} className="border-t border-gris-bordure">
                              <td className="px-3 py-2.5">{i + 1}</td>
                              <td className="px-3 py-2.5 font-medium">{l.libelle}</td>
                              <td className="px-3 py-2.5 text-right">
                                {formaterMontantCaisse(l.prixUnitaire, devise)}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={l.quantite}
                                  onChange={(e) => {
                                    const q = Math.max(1, Number(e.target.value) || 1);
                                    setLignes((prev) =>
                                      prev.map((x) =>
                                        x.cle === l.cle ? { ...x, quantite: q } : x
                                      )
                                    );
                                  }}
                                  className="w-16 rounded border border-gris-bordure px-2 py-1 text-center text-sm"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-right font-semibold">
                                {formaterMontantCaisse(l.prixUnitaire * l.quantite, devise)}
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => retirerLigne(l.cle)}
                                  className="rounded p-1.5 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="relative border-t border-gris-bordure">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => setRechercheOuverte((o) => !o)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-bleu-medical hover:underline"
                      >
                        <Plus className="h-4 w-4" />
                        {rechercheOuverte
                          ? t("caisse.facturation.fermerRechercheExamen")
                          : t("pharmacie.vente.ajouterMedicament")}
                      </button>
                      <p className="text-sm font-bold text-bleu-medical">
                        {t("caisse.facturation.totalMedicaments")}{" "}
                        {formaterMontantCaisse(totalMedicaments, devise)}
                      </p>
                    </div>
                    <RechercheAjoutMedicamentPharmacie
                      ouverte={rechercheOuverte}
                      onFermer={() => setRechercheOuverte(false)}
                      idsDejaPresents={idsPresents}
                      onAjouter={ajouterMedicament}
                      enCours={enCours}
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                    {t("caisse.facturation.modeFacture")}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {MODES_FACTURE_CAISSE.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setModeFacture(mode.id)}
                        className={cn(
                          "rounded-xl border px-2 py-1.5 text-left transition-colors",
                          modeFacture === mode.id
                            ? "border-bleu-medical bg-bleu-medical-clair/40 ring-1 ring-bleu-medical"
                            : "border-gris-bordure hover:bg-gris-tres-clair"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={cn(
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              modeFacture === mode.id
                                ? "border-bleu-medical bg-bleu-medical text-white"
                                : "border-gris-bordure"
                            )}
                          >
                            {modeFacture === mode.id && <Check className="h-3 w-3" />}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">
                              {t(`caisse.modesFacture.${mode.id}`)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-texte-secondaire">
                              {t(`caisse.modesFactureDesc.${mode.descriptionKey}`)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                    {t("caisse.facturation.infosPaiement")}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.montantAPayer")}
                      </span>
                      <input
                        readOnly
                        value={formaterMontantCaisse(montantDuJour, devise)}
                        className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair/50 px-3 py-2.5 text-sm font-semibold"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs font-medium">
                        {modeFacture === "AVANCE"
                          ? t("caisse.facturation.montantAvance")
                          : t("caisse.facturation.montantPaye")}
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={modeFacture === "AVANCE" ? montantAvance : montantPaiement}
                        onChange={(e) => {
                          const v = arrondirMontantCaisse(Number(e.target.value) || 0);
                          if (modeFacture === "AVANCE") setMontantAvance(v);
                          else setMontantPaiement(v);
                        }}
                        className="w-full rounded-lg border border-gris-bordure px-3 py-2.5 text-sm font-semibold"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.monnaie")}
                      </span>
                      <select
                        value={devise}
                        onChange={(e) => setDevise(e.target.value)}
                        className="w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm"
                      >
                        <option value="CDF">CDF</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>
                    <div className="text-sm sm:col-span-2 lg:col-span-3">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.datePaiement")}
                      </span>
                      <ChampDateNaissance
                        id="date-paiement-pharmacie"
                        value={datePaiement}
                        onChange={setDatePaiement}
                        required
                        anneeMin={new Date().getFullYear() - 2}
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.4fr]">
                    <label className="text-sm">
                      <span className="mb-1 block text-xs font-medium">
                        {t("caisse.facturation.numeroRecu")} *
                      </span>
                      <div className="relative">
                        <input
                          value={numeroRecu}
                          onChange={(e) => setNumeroRecu(e.target.value)}
                          className="w-full rounded-lg border border-gris-bordure py-2.5 pl-3 pr-10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNumeroRecu(`REC-PH-${Date.now().toString(36).toUpperCase()}`)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-gris-tres-clair"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.notes")}
                      </span>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                </section>
              </div>

              <div
                className={cn("space-y-4", ongletMobile !== "resume" && "hidden lg:block")}
              >
                {resumePanel}
              </div>
            </div>
          </>
        ))}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["TOUS", t("pharmacie.vente.filtreTous")],
                  ["FILE", t("pharmacie.vente.filtreFile")],
                  ["CLIENT", t("pharmacie.vente.filtreClients")],
                  ["ORDONNANCE", t("pharmacie.vente.filtreOrdonnances")],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFiltreSource(id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    filtreSource === id
                      ? "bg-bleu-medical text-white"
                      : "border border-gris-bordure bg-white text-texte-secondaire hover:bg-gris-tres-clair"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
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
            <FormulaireFiltresFacturationCaisse
              valeurs={brouillonFiltres}
              onChange={setBrouillonFiltres}
              onRechercher={() => {
                setFiltresAppliques(brouillonFiltres);
                setFiltresOuverts(false);
              }}
              onReinitialiser={() => {
                setBrouillonFiltres(FILTRES_FACTURATION_VIDES);
                setFiltresAppliques(FILTRES_FACTURATION_VIDES);
                setFiltreSource("TOUS");
              }}
              idPrefix="filtre-vente-pharmacie"
              masquerNumeroFacture
            />
          )}

          <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gris-bordure px-2 py-1.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-texte-principal">
                {t("pharmacie.vente.clientsEnregistres", { count: clientsFiltres.length })}
              </h3>
              <Link
                href="/sigh/pharmacie/nouveau-client"
                className="text-xs font-semibold text-bleu-medical hover:underline"
              >
                {t("pharmacie.vente.nouveauClient")}
              </Link>
            </div>
            {chargementClients ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-texte-secondaire">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : clientsFiltres.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                {nbFiltresActifs > 0
                  ? t("caisse.facturation.filtres.aucunResultat")
                  : t("pharmacie.vente.aucunClient")}
              </p>
            ) : (
              <div className="conteneur-tableau-sigh">
        <table className="tableau-sigh">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                    <tr>
                      <th className="px-2 py-1.5">N°</th>
                      <th className="px-2 py-1.5">{t("pharmacie.vente.colPatient")}</th>
                      <th className="hidden px-2 py-1.5 sm:table-cell">
                        {t("pharmacie.vente.colProvenance")}
                      </th>
                      <th className="px-2 py-1.5">{t("pharmacie.vente.colMedicaments")}</th>
                      <th className="px-2 py-1.5">{t("pharmacie.vente.colMontant")}</th>
                      <th className="px-2 py-1.5">{t("pharmacie.vente.colHeure")}</th>
                      <th className="px-2 py-1.5">{t("pharmacie.vente.colActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsFiltres.map((c, index) => (
                      <tr
                        key={c.dossierId}
                        onClick={() => selectionnerClient(c)}
                        className={cn(
                          "cursor-pointer border-t border-gris-bordure/70 hover:bg-slate-50",
                          dossierId === c.dossierId && "bg-bleu-medical-clair/30"
                        )}
                      >
                        <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">
                          {index + 1}
                        </td>
                        <td className="px-2 py-1.5 font-semibold">{c.nomComplet}</td>
                        <td className="hidden px-2 py-1.5 text-texte-secondaire sm:table-cell">
                          {c.provenance}
                        </td>
                        <td className="px-2 py-1.5 tabular-nums">{c.nbMedicaments || "—"}</td>
                        <td className="px-2 py-1.5 font-semibold">
                          {c.montantEstime > 0
                            ? formaterMontantCaisse(c.montantEstime, "CDF")
                            : "—"}
                        </td>
                        <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">
                          {c.heure}
                        </td>
                        <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => selectionnerClient(c)}
                            className="rounded-lg border border-bleu-medical/30 px-3 py-1.5 text-xs font-semibold text-bleu-medical hover:bg-bleu-medical-clair/40"
                          >
                            {t("caisse.facturation.ouvrir")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </MiseEnPagePharmacie>
  );
}
