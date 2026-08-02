"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FolderOpen,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  DESTINATIONS_APRES_ENCAISSEMENT,
  MODES_FACTURE_CAISSE,
  MODES_PAIEMENT_UI_CAISSE,
} from "@/constants/caisse";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import {
  calculerAge,
  formaterDate,
  formaterHeure,
  formaterMontantCaisse,
  initiales,
} from "@/features/caisse/utils-format";
import { cn } from "@/lib/utils";
import type {
  DestinationApresEncaissement,
  DossierFacturationCaisse,
  ModeFactureCaisse,
  PatientFileCaisse,
} from "@/lib/caisse/types";
import type { ModePaiement } from "@/generated/prisma/client";

interface PropsContenuFacturationCaisse {
  utilisateur: UtilisateurCaisse;
}

type ModeUi = (typeof MODES_PAIEMENT_UI_CAISSE)[number]["id"];

function libelleSexe(sexe: string | null) {
  if (sexe === "FEMININ") return "Féminin";
  if (sexe === "MASCULIN") return "Masculin";
  return sexe ?? "—";
}

export function ContenuFacturationCaisse({ utilisateur }: PropsContenuFacturationCaisse) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dossierInitial = searchParams.get("dossier");

  const [file, setFile] = useState<PatientFileCaisse[]>([]);
  const [dossierId, setDossierId] = useState<string | null>(dossierInitial);
  const [dossier, setDossier] = useState<DossierFacturationCaisse | null>(null);
  const [chargementFile, setChargementFile] = useState(true);
  const [chargementDossier, setChargementDossier] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ongletMobile, setOngletMobile] = useState<"examens" | "resume">("examens");

  const [modeFacture, setModeFacture] = useState<ModeFactureCaisse>("CASH");
  const [modeUi, setModeUi] = useState<ModeUi>("ESPECES");
  const [remise, setRemise] = useState(0);
  const [fraisDivers, setFraisDivers] = useState(0);
  const [montantPaiement, setMontantPaiement] = useState(0);
  const [devise, setDevise] = useState("USD");
  const [notes, setNotes] = useState("");
  const [datePaiement, setDatePaiement] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [numeroRecu, setNumeroRecu] = useState("");
  const [transfererApres, setTransfererApres] = useState(true);
  const [destinationApres, setDestinationApres] =
    useState<DestinationApresEncaissement>("LABORATOIRE");
  const [lignesMasquees, setLignesMasquees] = useState<Set<string>>(new Set());

  const chargerFile = useCallback(async () => {
    setChargementFile(true);
    try {
      const res = await fetch("/api/caisse/patients");
      const data = (await res.json()) as { patients?: PatientFileCaisse[] };
      if (res.ok) setFile(data.patients ?? []);
    } finally {
      setChargementFile(false);
    }
  }, []);

  const chargerDossier = useCallback(
    async (id: string) => {
      setChargementDossier(true);
      setErreur(null);
      setLignesMasquees(new Set());
      try {
        const res = await fetch(`/api/caisse/patients/${id}`);
        const data = (await res.json()) as {
          dossier?: DossierFacturationCaisse;
          erreur?: string;
        };
        if (!res.ok || !data.dossier) {
          throw new Error(data.erreur ?? t("caisse.facturation.erreurEncaissement"));
        }
        setDossier(data.dossier);
        setDevise(data.dossier.facture.devise === "CDF" ? "CDF" : "USD");
        setNumeroRecu(
          data.dossier.facture.numeroFacture?.replace(/^FAC-/, "REC-") ??
            `REC-${new Date().getFullYear()}-…`
        );
        const total = data.dossier.facture.lignes.reduce((a, l) => a + l.montant, 0);
        const reste = Math.max(0, total - data.dossier.facture.montantPaye);
        setRemise(0);
        setFraisDivers(0);
        setMontantPaiement(reste);
      } catch (e) {
        setDossier(null);
        setErreur(
          e instanceof Error ? e.message : t("caisse.facturation.erreurEncaissement")
        );
      } finally {
        setChargementDossier(false);
      }
    },
    [t]
  );

  useEffect(() => {
    void chargerFile();
  }, [chargerFile]);

  useEffect(() => {
    if (dossierId) void chargerDossier(dossierId);
  }, [dossierId, chargerDossier]);

  useEffect(() => {
    if (!dossierId && file.length > 0) {
      setDossierId(file[0].dossierId);
      router.replace(`/sigh/caisse/facturation?dossier=${file[0].dossierId}`);
    }
  }, [dossierId, file, router]);

  const lignesVisibles = useMemo(() => {
    if (!dossier) return [];
    return dossier.facture.lignes.filter((l) => !lignesMasquees.has(l.id));
  }, [dossier, lignesMasquees]);

  const totalExamens = useMemo(
    () => lignesVisibles.reduce((acc, l) => acc + l.montant, 0),
    [lignesVisibles]
  );
  const sousTotal = Math.max(0, totalExamens - (remise || 0));
  const totalAPayer = sousTotal + (fraisDivers || 0);
  const dejaPaye = dossier?.facture.montantPaye ?? 0;
  const resteAPayer = Math.max(0, totalAPayer - dejaPaye);

  useEffect(() => {
    setMontantPaiement(resteAPayer);
  }, [resteAPayer]);

  const age = calculerAge(dossier?.dateNaissance ?? null);
  const modePrisma: ModePaiement =
    MODES_PAIEMENT_UI_CAISSE.find((m) => m.id === modeUi)?.modePrisma ?? "ESPECES";

  const regenererRecu = () => {
    const stamp = Date.now().toString().slice(-6);
    setNumeroRecu(`REC-${new Date().getFullYear()}-${stamp}`);
  };

  const encaisser = async () => {
    if (!dossierId) return;
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      if (!dossier?.facture.id) {
        const prep = await fetch("/api/caisse/factures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dossierId }),
        });
        const prepData = (await prep.json()) as {
          dossier?: DossierFacturationCaisse;
          erreur?: string;
        };
        if (!prep.ok || !prepData.dossier) throw new Error(prepData.erreur);
        setDossier(prepData.dossier);
      }

      const res = await fetch("/api/caisse/factures/encaisser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          montant: montantPaiement,
          modePaiement: modePrisma,
          modeFacture,
          remise,
          reference: [
            `recu=${numeroRecu}`,
            `devise=${devise}`,
            fraisDivers > 0 ? `frais=${fraisDivers}` : null,
            notes.trim() || null,
          ]
            .filter(Boolean)
            .join("|"),
          destinationApres: transfererApres ? destinationApres : "AUCUNE",
        }),
      });
      const data = (await res.json()) as {
        dossier?: DossierFacturationCaisse;
        erreur?: string;
      };
      if (!res.ok || !data.dossier) {
        throw new Error(data.erreur ?? t("caisse.facturation.erreurEncaissement"));
      }
      setDossier(data.dossier);
      setMessage(t("caisse.facturation.succesEncaissement"));
      await chargerFile();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("caisse.facturation.erreurEncaissement"));
    } finally {
      setEnCours(false);
    }
  };

  const resumePanel = dossier && (
    <section className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("caisse.facturation.resumeFacture")}
      </h3>
      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-texte-secondaire">{t("caisse.facturation.totalExamens")}</dt>
          <dd className="font-medium">{formaterMontantCaisse(totalExamens, devise)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-texte-secondaire">{t("caisse.facturation.remise")}</dt>
          <dd>
            <input
              type="number"
              min={0}
              step="0.01"
              value={remise}
              onChange={(e) => setRemise(Number(e.target.value) || 0)}
              className="w-24 rounded-lg border border-gris-bordure px-2 py-1.5 text-right text-sm"
            />
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-texte-secondaire">{t("caisse.facturation.sousTotal")}</dt>
          <dd className="font-medium">{formaterMontantCaisse(sousTotal, devise)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-texte-secondaire">{t("caisse.facturation.fraisDivers")}</dt>
          <dd>
            <input
              type="number"
              min={0}
              step="0.01"
              value={fraisDivers}
              onChange={(e) => setFraisDivers(Number(e.target.value) || 0)}
              className="w-24 rounded-lg border border-gris-bordure px-2 py-1.5 text-right text-sm"
            />
          </dd>
        </div>
        <div className="border-t border-gris-bordure pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-texte-secondaire">
            {t("caisse.facturation.totalAPayer")}
          </p>
          <p className="mt-1 text-2xl font-bold text-bleu-medical">
            {formaterMontantCaisse(totalAPayer, devise)}
          </p>
        </div>
        <div className="flex justify-between gap-3 pt-1">
          <dt className="text-texte-secondaire">{t("caisse.facturation.montantPaye")}</dt>
          <dd className="font-medium">
            {formaterMontantCaisse(montantPaiement, devise)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-texte-secondaire">{t("caisse.facturation.resteAPayer")}</dt>
          <dd
            className={cn(
              "font-bold",
              Math.max(0, resteAPayer - montantPaiement) <= 0
                ? "text-emerald-600"
                : "text-amber-700"
            )}
          >
            {formaterMontantCaisse(Math.max(0, resteAPayer - montantPaiement), devise)}
          </dd>
        </div>
      </dl>

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
                name="modePaiement"
                checked={modeUi === mode.id}
                onChange={() => setModeUi(mode.id)}
                className="accent-emerald-600"
              />
              {t(`caisse.modesPaiement.${mode.id}`)}
            </label>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.layout.titre")}
      sousTitre={t("caisse.facturation.sousTitre")}
    >
      <div className="mx-auto w-full max-w-7xl space-y-4 pb-24 lg:pb-6">
        <Link
          href="/sigh/caisse/patients"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-bleu-medical hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("caisse.facturation.retourListe")}
        </Link>

        {!dossierId ? (
          <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-16 text-center text-sm text-texte-secondaire">
            {chargementFile ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              t("caisse.facturation.selectionnerPatient")
            )}
          </div>
        ) : chargementDossier || !dossier ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            {/* Patient header — maquette */}
            <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bleu-medical text-base font-bold text-white">
                  {initiales(dossier.prenom, dossier.nom)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-texte-principal">
                      {dossier.prenom} {dossier.nom}
                    </h2>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                      {dossier.statutAttente === "EN_ATTENTE_PAIEMENT"
                        ? t("caisse.facturation.enAttentePaiement")
                        : dossier.statutAttente === "PAYE"
                          ? t("caisse.facturation.paye")
                          : t("caisse.facturation.horsFile")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-texte-secondaire">
                    {t("caisse.facturation.idDossier")} : {dossier.numeroDossier}
                    {" | "}
                    {age != null ? t("caisse.facturation.age", { age }) : "—"}
                    {" | "}
                    {libelleSexe(dossier.sexe)}
                    {dossier.telephone ? ` | ${dossier.telephone}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    {dossier.recuLe && (
                      <span className="rounded-full border border-bleu-medical/30 bg-bleu-medical-clair/40 px-2.5 py-0.5 text-xs font-medium text-bleu-medical">
                        {t("caisse.facturation.recuLe", {
                          date: `${formaterDate(dossier.recuLe)} à ${formaterHeure(dossier.recuLe)}`,
                        })}
                      </span>
                    )}
                    {dossier.transferePar && (
                      <span className="text-xs text-texte-secondaire">
                        {t("caisse.facturation.transferePar", {
                          nom: dossier.transferePar,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gris-bordure px-3 py-2 text-xs font-semibold text-bleu-medical hover:bg-bleu-medical-clair/40"
                >
                  <FolderOpen className="h-4 w-4" />
                  {t("caisse.facturation.voirDossierMedical")}
                </button>
              </div>
            </section>

            {/* Mobile tabs */}
            <div className="flex gap-1 rounded-lg bg-gris-tres-clair p-1 lg:hidden">
              {(["examens", "resume"] as const).map((onglet) => (
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
                  {onglet === "examens"
                    ? t("caisse.facturation.ongletExamens")
                    : t("caisse.facturation.ongletResume")}
                </button>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div
                className={cn(
                  "space-y-4",
                  ongletMobile !== "examens" && "hidden lg:block"
                )}
              >
                {/* Examens prescrits */}
                <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                  <div className="border-b border-gris-bordure px-4 py-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                      {t("caisse.facturation.examensPrescrits")}
                    </h3>
                  </div>
                  {lignesVisibles.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                      {t("caisse.facturation.aucuneLigne")}
                    </p>
                  ) : (
                    <>
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[560px] text-left text-sm">
                          <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                            <tr>
                              <th className="px-3 py-2.5">{t("caisse.facturation.numero")}</th>
                              <th className="px-3 py-2.5">{t("caisse.facturation.examen")}</th>
                              <th className="px-3 py-2.5 text-right">
                                {t("caisse.facturation.prixUnit")}
                              </th>
                              <th className="px-3 py-2.5 text-right">
                                {t("caisse.facturation.quantite")}
                              </th>
                              <th className="px-3 py-2.5 text-right">
                                {t("caisse.facturation.montant")}
                              </th>
                              <th className="px-3 py-2.5" />
                            </tr>
                          </thead>
                          <tbody>
                            {lignesVisibles.map((l, i) => (
                              <tr key={l.id} className="border-t border-gris-bordure">
                                <td className="px-3 py-2.5 text-texte-secondaire">{i + 1}</td>
                                <td className="px-3 py-2.5 font-medium">{l.libelle}</td>
                                <td className="px-3 py-2.5 text-right">
                                  {formaterMontantCaisse(l.prixUnitaire, devise)}
                                </td>
                                <td className="px-3 py-2.5 text-right">{l.quantite}</td>
                                <td className="px-3 py-2.5 text-right font-semibold">
                                  {formaterMontantCaisse(l.montant, devise)}
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <button
                                    type="button"
                                    aria-label={t("caisse.facturation.supprimerLigne")}
                                    onClick={() =>
                                      setLignesMasquees((prev) => new Set(prev).add(l.id))
                                    }
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
                      <ul className="divide-y divide-gris-bordure md:hidden">
                        {lignesVisibles.map((l) => (
                          <li
                            key={l.id}
                            className="flex items-start justify-between gap-2 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold">{l.libelle}</p>
                              <p className="text-xs text-texte-secondaire">
                                {l.quantite}× {formaterMontantCaisse(l.prixUnitaire, devise)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold">
                                {formaterMontantCaisse(l.montant, devise)}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  setLignesMasquees((prev) => new Set(prev).add(l.id))
                                }
                                className="rounded p-1 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gris-bordure px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-bleu-medical hover:underline"
                    >
                      <Plus className="h-4 w-4" />
                      {t("caisse.facturation.ajouterExamen")}
                    </button>
                    <p className="text-sm font-bold text-bleu-medical">
                      {t("caisse.facturation.totalExamens")}{" "}
                      {formaterMontantCaisse(totalExamens, devise)}
                    </p>
                  </div>
                </section>

                {/* Mode de facture — 6 cartes */}
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
                          "rounded-xl border px-3 py-3 text-left transition-colors",
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
                            <p className="text-sm font-semibold text-texte-principal">
                              {t(`caisse.modesFacture.${mode.id}`)}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-snug text-texte-secondaire">
                              {t(`caisse.modesFactureDesc.${mode.descriptionKey}`)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Infos paiement */}
                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                    {t("caisse.facturation.infosPaiement")}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.montantAPayer")}
                      </span>
                      <input
                        readOnly
                        value={formaterMontantCaisse(totalAPayer, devise)}
                        className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair/50 px-3 py-2.5 text-sm font-semibold"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs font-medium text-texte-principal">
                        {t("caisse.facturation.montantPaye")} *
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={montantPaiement}
                        onChange={(e) => setMontantPaiement(Number(e.target.value) || 0)}
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
                        <option value="USD">USD</option>
                        <option value="CDF">CDF</option>
                      </select>
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.datePaiement")}
                      </span>
                      <input
                        type="date"
                        value={datePaiement}
                        onChange={(e) => setDatePaiement(e.target.value)}
                        className="w-full rounded-lg border border-gris-bordure px-3 py-2.5 text-sm"
                      />
                    </label>
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.4fr]">
                    <label className="text-sm">
                      <span className="mb-1 block text-xs font-medium text-texte-principal">
                        {t("caisse.facturation.numeroRecu")} *
                      </span>
                      <div className="relative">
                        <input
                          value={numeroRecu}
                          onChange={(e) => setNumeroRecu(e.target.value)}
                          className="w-full rounded-lg border border-gris-bordure py-2.5 pl-3 pr-10 text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={regenererRecu}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-bleu-medical"
                          aria-label="Régénérer"
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
                className={cn(
                  "space-y-4",
                  ongletMobile !== "resume" && "hidden lg:block"
                )}
              >
                {resumePanel}

                <label className="flex items-center gap-2 rounded-xl border border-gris-bordure bg-white px-4 py-3 text-sm shadow-sm">
                  <input
                    type="checkbox"
                    checked={transfererApres}
                    onChange={(e) => setTransfererApres(e.target.checked)}
                    className="accent-bleu-medical"
                  />
                  <span>{t("caisse.facturation.transfererApres")}</span>
                </label>
                {transfererApres && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {DESTINATIONS_APRES_ENCAISSEMENT.filter((d) => d !== "AUCUNE").map(
                      (dest) => (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => setDestinationApres(dest)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-xs font-medium",
                            destinationApres === dest
                              ? "border-bleu-medical bg-bleu-medical text-white"
                              : "border-gris-bordure"
                          )}
                        >
                          {dest === "LABORATOIRE"
                            ? t("caisse.facturation.destinationLabo")
                            : t("caisse.facturation.destinationPharma")}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {message && (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </p>
            )}
            {erreur && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
            )}

            {/* Actions desktop */}
            <div className="hidden flex-wrap items-center gap-2 lg:flex">
              <Bouton
                type="button"
                variante="contour"
                onClick={() => router.push("/sigh/caisse/patients")}
              >
                {t("caisse.facturation.annuler")}
              </Bouton>
              <Bouton type="button" variante="contour" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                {t("caisse.facturation.imprimerProforma")}
              </Bouton>
              <Bouton type="button" variante="contour" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                {t("caisse.facturation.imprimerFacture")}
              </Bouton>
              <Bouton
                type="button"
                onClick={() => void encaisser()}
                disabled={enCours || resteAPayer <= 0 || montantPaiement <= 0}
                className="ml-auto"
              >
                {enCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {t("caisse.facturation.validerEncaisser")}
              </Bouton>
            </div>

            {/* Sticky mobile CTA */}
            <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 border-t border-gris-bordure bg-white px-3 py-2.5 shadow-lg lg:hidden">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-texte-secondaire">
                  {t("caisse.facturation.totalAPayer")}
                </span>
                <span className="font-bold text-bleu-medical">
                  {formaterMontantCaisse(totalAPayer, devise)}
                </span>
              </div>
              <Bouton
                type="button"
                onClick={() => void encaisser()}
                disabled={enCours || resteAPayer <= 0 || montantPaiement <= 0}
                className="w-full justify-center"
              >
                {enCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("caisse.facturation.encaisserPaiement")
                )}
              </Bouton>
            </div>

            {/* Historique paiements patient */}
            <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                  {t("caisse.facturation.historiquePaiements")}
                </h3>
                <button
                  type="button"
                  className="text-xs font-semibold text-bleu-medical hover:underline"
                >
                  {t("caisse.facturation.voirTout")}
                </button>
              </div>
              {dossier.facture.historiquePaiements.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                  {t("caisse.facturation.aucunPaiement")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                      <tr>
                        <th className="px-4 py-2.5">{t("caisse.facturation.numeroRecu")}</th>
                        <th className="px-4 py-2.5">{t("caisse.facturation.date")}</th>
                        <th className="px-4 py-2.5 text-right">
                          {t("caisse.facturation.montant")}
                        </th>
                        <th className="px-4 py-2.5">{t("caisse.facturation.mode")}</th>
                        <th className="px-4 py-2.5">{t("caisse.facturation.type")}</th>
                        <th className="px-4 py-2.5">{t("caisse.facturation.utilisateur")}</th>
                        <th className="px-4 py-2.5">{t("caisse.facturation.statut")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossier.facture.historiquePaiements.map((p) => (
                        <tr key={p.id} className="border-t border-gris-bordure">
                          <td className="px-4 py-2.5 font-medium text-bleu-medical">
                            {p.numeroRecu}
                          </td>
                          <td className="px-4 py-2.5 text-texte-secondaire">
                            {formaterDate(p.payeLe)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold">
                            {formaterMontantCaisse(p.montant, devise)}
                          </td>
                          <td className="px-4 py-2.5">
                            {t(`caisse.modesPaiement.${p.mode === "VIREMENT" ? "VIREMENT" : p.mode}`, {
                              defaultValue: p.mode,
                            })}
                          </td>
                          <td className="px-4 py-2.5 text-texte-secondaire">
                            {p.typeFacture
                              ? t(`caisse.modesFacture.${p.typeFacture}`, {
                                  defaultValue: p.typeFacture,
                                })
                              : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-texte-secondaire">{p.caissier}</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                              {t("caisse.facturation.paye")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MiseEnPageCaisse>
  );
}
