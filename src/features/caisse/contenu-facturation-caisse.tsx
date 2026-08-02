"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Loader2,
  Printer,
  Receipt,
  Wallet,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  DESTINATIONS_APRES_ENCAISSEMENT,
  MODES_FACTURE_CAISSE,
  MODES_PAIEMENT_CAISSE,
} from "@/constants/caisse";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { formaterHeure, formaterMontantCaisse } from "@/features/caisse/utils-format";
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

export function ContenuFacturationCaisse({ utilisateur }: PropsContenuFacturationCaisse) {
  const { t } = useTranslation();
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

  const [modeFacture, setModeFacture] = useState<ModeFactureCaisse>("CASH");
  const [modePaiement, setModePaiement] = useState<ModePaiement>("ESPECES");
  const [remise, setRemise] = useState(0);
  const [montantPaiement, setMontantPaiement] = useState(0);
  const [reference, setReference] = useState("");
  const [destinationApres, setDestinationApres] =
    useState<DestinationApresEncaissement>("LABORATOIRE");

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

  const chargerDossier = useCallback(async (id: string) => {
    setChargementDossier(true);
    setErreur(null);
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
      const reste = Math.max(
        0,
        data.dossier.facture.montantTotal - data.dossier.facture.montantPaye
      );
      setRemise(0);
      setMontantPaiement(reste);
    } catch (e) {
      setDossier(null);
      setErreur(e instanceof Error ? e.message : t("caisse.facturation.erreurEncaissement"));
    } finally {
      setChargementDossier(false);
    }
  }, [t]);

  useEffect(() => {
    void chargerFile();
  }, [chargerFile]);

  useEffect(() => {
    if (dossierId) void chargerDossier(dossierId);
  }, [dossierId, chargerDossier]);

  useEffect(() => {
    if (!dossierId && file.length > 0) {
      setDossierId(file[0].dossierId);
    }
  }, [dossierId, file]);

  const totalApresRemise = useMemo(() => {
    if (!dossier) return 0;
    return Math.max(0, dossier.facture.montantTotal - (remise || 0));
  }, [dossier, remise]);

  const resteAPayer = useMemo(() => {
    if (!dossier) return 0;
    return Math.max(0, totalApresRemise - dossier.facture.montantPaye);
  }, [dossier, totalApresRemise]);

  useEffect(() => {
    setMontantPaiement(resteAPayer);
  }, [resteAPayer]);

  const preparerFacture = async () => {
    if (!dossierId) return;
    setEnCours(true);
    setErreur(null);
    try {
      const res = await fetch("/api/caisse/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId }),
      });
      const data = (await res.json()) as {
        dossier?: DossierFacturationCaisse;
        erreur?: string;
      };
      if (!res.ok || !data.dossier) throw new Error(data.erreur);
      setDossier(data.dossier);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("caisse.facturation.erreurEncaissement"));
    } finally {
      setEnCours(false);
    }
  };

  const encaisser = async () => {
    if (!dossierId) return;
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/caisse/factures/encaisser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          montant: montantPaiement,
          modePaiement,
          modeFacture,
          remise,
          reference: reference.trim() || undefined,
          destinationApres,
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

  const statutLabel =
    dossier?.statutAttente === "EN_ATTENTE_PAIEMENT"
      ? t("caisse.facturation.enAttentePaiement")
      : dossier?.statutAttente === "PAYE"
        ? t("caisse.facturation.paye")
        : t("caisse.facturation.horsFile");

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.facturation.titre")}
      sousTitre={t("caisse.facturation.sousTitre")}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[240px_1fr]">
        {/* File latérale */}
        <aside className="rounded-xl border border-gris-bordure bg-white p-3 shadow-sm">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-texte-secondaire">
            {t("caisse.nav.patientsEnAttente")}
          </p>
          {chargementFile ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-texte-secondaire" />
            </div>
          ) : file.length === 0 ? (
            <p className="px-1 py-6 text-xs text-texte-secondaire">{t("caisse.patients.vide")}</p>
          ) : (
            <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
              {file.map((p) => (
                <li key={p.fileAttenteId}>
                  <button
                    type="button"
                    onClick={() => {
                      setDossierId(p.dossierId);
                      setMessage(null);
                      setErreur(null);
                    }}
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                      dossierId === p.dossierId
                        ? "bg-bleu-medical text-white"
                        : "hover:bg-gris-tres-clair"
                    )}
                  >
                    <p className="truncate text-sm font-semibold">
                      {p.prenom} {p.nom}
                    </p>
                    <p
                      className={cn(
                        "truncate text-[11px]",
                        dossierId === p.dossierId ? "text-white/80" : "text-texte-secondaire"
                      )}
                    >
                      {p.numeroPatient}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Zone facturation */}
        <div className="space-y-4">
          {!dossierId ? (
            <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-16 text-center text-sm text-texte-secondaire">
              {t("caisse.facturation.selectionnerPatient")}
            </div>
          ) : chargementDossier || !dossier ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <>
              {/* En-tête patient */}
              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-texte-principal">
                      {dossier.prenom} {dossier.nom}
                    </h2>
                    <p className="mt-1 text-sm text-texte-secondaire">
                      {t("caisse.facturation.patient")} {dossier.numeroPatient} ·{" "}
                      {t("caisse.facturation.dossier")} {dossier.numeroDossier}
                    </p>
                    {dossier.telephone && (
                      <p className="mt-0.5 text-sm text-texte-secondaire">
                        {t("caisse.facturation.telephone")} : {dossier.telephone}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      dossier.statutAttente === "EN_ATTENTE_PAIEMENT"
                        ? "bg-amber-100 text-amber-800"
                        : dossier.statutAttente === "PAYE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                    )}
                  >
                    {statutLabel}
                  </span>
                </div>
                {dossier.facture.numeroFacture && (
                  <p className="mt-3 text-xs text-texte-secondaire">
                    {dossier.facture.numeroFacture}
                    {dossier.facture.statut
                      ? ` · ${t(`caisse.statutsFacture.${dossier.facture.statut}`)}`
                      : ""}
                  </p>
                )}
              </section>

              {/* Table prestations */}
              <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                <div className="border-b border-gris-bordure px-4 py-3">
                  <h3 className="text-sm font-semibold text-texte-principal">
                    {t("caisse.facturation.examensPrescrits")}
                  </h3>
                </div>
                {dossier.facture.lignes.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                    {t("caisse.facturation.aucuneLigne")}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">
                            {t("caisse.facturation.libelle")}
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-right">
                            {t("caisse.facturation.quantite")}
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-right">
                            {t("caisse.facturation.prixUnitaire")}
                          </th>
                          <th className="px-4 py-2.5 font-semibold text-right">
                            {t("caisse.facturation.montant")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dossier.facture.lignes.map((l) => (
                          <tr key={l.id} className="border-t border-gris-bordure">
                            <td className="px-4 py-3 font-medium text-texte-principal">
                              {l.libelle}
                            </td>
                            <td className="px-4 py-3 text-right text-texte-secondaire">
                              {l.quantite}
                            </td>
                            <td className="px-4 py-3 text-right text-texte-secondaire">
                              {formaterMontantCaisse(l.prixUnitaire, dossier.facture.devise)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-texte-principal">
                              {formaterMontantCaisse(l.montant, dossier.facture.devise)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* Résumé + modes */}
                <section className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="text-sm font-semibold text-texte-principal">
                    {t("caisse.facturation.resumeFacture")}
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-texte-secondaire">{t("caisse.facturation.total")}</dt>
                      <dd className="font-medium">
                        {formaterMontantCaisse(
                          dossier.facture.montantTotal,
                          dossier.facture.devise
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-texte-secondaire">{t("caisse.facturation.remise")}</dt>
                      <dd>
                        <input
                          type="number"
                          min={0}
                          value={remise}
                          onChange={(e) => setRemise(Number(e.target.value) || 0)}
                          className="w-28 rounded-lg border border-gris-bordure px-2 py-1.5 text-right text-sm"
                        />
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-gris-bordure pt-2">
                      <dt className="font-semibold">{t("caisse.facturation.totalAPayer")}</dt>
                      <dd className="font-bold text-bleu-medical">
                        {formaterMontantCaisse(totalApresRemise, dossier.facture.devise)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-texte-secondaire">{t("caisse.facturation.dejaPaye")}</dt>
                      <dd>
                        {formaterMontantCaisse(
                          dossier.facture.montantPaye,
                          dossier.facture.devise
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-semibold">{t("caisse.facturation.resteAPayer")}</dt>
                      <dd className="font-bold text-amber-700">
                        {formaterMontantCaisse(resteAPayer, dossier.facture.devise)}
                      </dd>
                    </div>
                  </dl>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-texte-secondaire">
                      {t("caisse.facturation.modesFacture")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {MODES_FACTURE_CAISSE.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setModeFacture(mode)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                            modeFacture === mode
                              ? "border-bleu-medical bg-bleu-medical text-white"
                              : "border-gris-bordure bg-white hover:bg-gris-tres-clair"
                          )}
                        >
                          {t(`caisse.modesFacture.${mode}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-texte-secondaire">
                      {t("caisse.facturation.moyensPaiement")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {MODES_PAIEMENT_CAISSE.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setModePaiement(mode)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                            modePaiement === mode
                              ? "border-vert-sante bg-emerald-600 text-white"
                              : "border-gris-bordure bg-white hover:bg-gris-tres-clair"
                          )}
                        >
                          {t(`caisse.modesPaiement.${mode}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Paiement + actions */}
                <section className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-texte-principal">
                      {t("caisse.facturation.montantPaiement")}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={resteAPayer}
                      value={montantPaiement}
                      onChange={(e) => setMontantPaiement(Number(e.target.value) || 0)}
                      className="w-full rounded-lg border border-gris-bordure px-3 py-2.5 text-sm font-semibold"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-texte-principal">
                      {t("caisse.facturation.reference")}
                    </span>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full rounded-lg border border-gris-bordure px-3 py-2.5 text-sm"
                    />
                  </label>

                  <div>
                    <p className="mb-1.5 text-sm font-medium text-texte-principal">
                      {t("caisse.facturation.destination")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {DESTINATIONS_APRES_ENCAISSEMENT.map((dest) => (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => setDestinationApres(dest)}
                          className={cn(
                            "rounded-lg border px-2.5 py-1.5 text-xs font-medium",
                            destinationApres === dest
                              ? "border-bleu-medical bg-bleu-medical-clair/50 text-bleu-medical"
                              : "border-gris-bordure hover:bg-gris-tres-clair"
                          )}
                        >
                          {dest === "LABORATOIRE"
                            ? t("caisse.facturation.destinationLabo")
                            : dest === "PHARMACIE"
                              ? t("caisse.facturation.destinationPharma")
                              : t("caisse.facturation.destinationAucune")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {message && (
                    <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {message}
                    </p>
                  )}
                  {erreur && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
                  )}

                  <div className="flex flex-col gap-2">
                    {!dossier.facture.id && (
                      <Bouton
                        type="button"
                        variante="secondaire"
                        onClick={() => void preparerFacture()}
                        disabled={enCours || dossier.facture.lignes.length === 0}
                        className="w-full justify-center"
                      >
                        <Receipt className="h-4 w-4" />
                        {t("caisse.facturation.preparerFacture")}
                      </Bouton>
                    )}
                    <Bouton
                      type="button"
                      onClick={() => void encaisser()}
                      disabled={enCours || resteAPayer <= 0 || montantPaiement <= 0}
                      className="w-full justify-center"
                    >
                      {enCours ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wallet className="h-4 w-4" />
                      )}
                      {t("caisse.facturation.validerEncaisser")}
                    </Bouton>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-2 text-xs font-medium hover:bg-gris-tres-clair"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        {t("caisse.facturation.imprimerProforma")}
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-2 text-xs font-medium hover:bg-gris-tres-clair"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        {t("caisse.facturation.imprimerFacture")}
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Historique */}
              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
                <h3 className="mb-3 text-sm font-semibold text-texte-principal">
                  {t("caisse.facturation.historiquePaiements")}
                </h3>
                {dossier.facture.historiquePaiements.length === 0 ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("caisse.facturation.aucunPaiement")}
                  </p>
                ) : (
                  <ul className="divide-y divide-gris-bordure">
                    {dossier.facture.historiquePaiements.map((p) => (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-texte-principal">
                            {formaterMontantCaisse(p.montant, dossier.facture.devise)} ·{" "}
                            {t(`caisse.modesPaiement.${p.mode}`)}
                          </p>
                          <p className="text-xs text-texte-secondaire">
                            {formaterHeure(p.payeLe)} · {p.caissier}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </MiseEnPageCaisse>
  );
}
