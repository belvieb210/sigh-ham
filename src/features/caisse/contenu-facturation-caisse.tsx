"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Plus,
  Printer,
  Smartphone,
  Shield,
  Trash2,
  Wallet,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  DESTINATIONS_APRES_ENCAISSEMENT,
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
  PatientFileCaisse,
} from "@/lib/caisse/types";
import type { ModePaiement } from "@/generated/prisma/client";

interface PropsContenuFacturationCaisse {
  utilisateur: UtilisateurCaisse;
}

type ModeUi = (typeof MODES_PAIEMENT_UI_CAISSE)[number]["id"];

const ICONES_MODE: Record<ModeUi, typeof Banknote> = {
  ESPECES: Banknote,
  CARTE: CreditCard,
  MOBILE_MONEY: Smartphone,
  ASSURANCE: Shield,
  MIXTE: Wallet,
};

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
  const [ongletMobile, setOngletMobile] = useState<"prestations" | "resume">("prestations");

  const [modeUi, setModeUi] = useState<ModeUi>("ESPECES");
  const [remise, setRemise] = useState(0);
  const [montantPaiement, setMontantPaiement] = useState(0);
  const [notes, setNotes] = useState("");
  const [destinationApres, setDestinationApres] =
    useState<DestinationApresEncaissement>("LABORATOIRE");
  const [lignesMasquees, setLignesMasquees] = useState<Set<string>>(new Set());

  const maintenant = useMemo(() => new Date(), []);

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
        const reste = Math.max(
          0,
          data.dossier.facture.montantTotal - data.dossier.facture.montantPaye
        );
        setRemise(0);
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
    if (!dossierId && file.length > 0) setDossierId(file[0].dossierId);
  }, [dossierId, file]);

  const lignesVisibles = useMemo(() => {
    if (!dossier) return [];
    return dossier.facture.lignes.filter((l) => !lignesMasquees.has(l.id));
  }, [dossier, lignesMasquees]);

  const sousTotal = useMemo(
    () => lignesVisibles.reduce((acc, l) => acc + l.montant, 0),
    [lignesVisibles]
  );

  const totalApresRemise = Math.max(0, sousTotal - (remise || 0));
  const dejaPaye = dossier?.facture.montantPaye ?? 0;
  const resteAPayer = Math.max(0, totalApresRemise - dejaPaye);

  useEffect(() => {
    setMontantPaiement(resteAPayer);
  }, [resteAPayer]);

  const numeroRecu =
    dossier?.facture.numeroFacture?.replace("FAC-", "REC-") ??
    `REC-${maintenant.getFullYear()}-…`;

  const age = calculerAge(dossier?.dateNaissance ?? null);
  const modePrisma: ModePaiement =
    MODES_PAIEMENT_UI_CAISSE.find((m) => m.id === modeUi)?.modePrisma ?? "ESPECES";

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
          modeFacture: "CASH",
          remise,
          reference: [modeUi !== modePrisma ? `ui=${modeUi}` : null, notes.trim() || null]
            .filter(Boolean)
            .join("|"),
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

  const ouvrirPatient = (id: string) => {
    setDossierId(id);
    setMessage(null);
    setErreur(null);
    setOngletMobile("prestations");
    router.replace(`/sigh/caisse/facturation?dossier=${id}`);
  };

  const resumePanel = dossier && (
    <section className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-texte-secondaire">
        {t("caisse.facturation.resumeFacture")}
      </h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-texte-secondaire">{t("caisse.facturation.sousTotal")}</dt>
          <dd>{formaterMontantCaisse(sousTotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-texte-secondaire">{t("caisse.facturation.remise")}</dt>
          <dd>
            <input
              type="number"
              min={0}
              value={remise}
              onChange={(e) => setRemise(Number(e.target.value) || 0)}
              className="w-24 rounded-lg border border-gris-bordure px-2 py-1 text-right text-sm"
            />
          </dd>
        </div>
        <div className="flex justify-between border-t border-gris-bordure pt-2">
          <dt className="font-semibold">{t("caisse.facturation.totalAPayer")}</dt>
          <dd className="text-lg font-bold text-bleu-medical">
            {formaterMontantCaisse(totalApresRemise)}
          </dd>
        </div>
      </dl>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">{t("caisse.facturation.montantPaye")}</span>
        <input
          type="number"
          min={0}
          value={montantPaiement}
          onChange={(e) => setMontantPaiement(Number(e.target.value) || 0)}
          className="w-full rounded-lg border border-gris-bordure px-3 py-2.5 text-sm font-semibold"
        />
      </label>
      <p className="text-sm">
        <span className="text-texte-secondaire">{t("caisse.facturation.resteAPayer")} : </span>
        <span
          className={cn(
            "font-bold",
            resteAPayer - montantPaiement <= 0 ? "text-emerald-600" : "text-amber-700"
          )}
        >
          {formaterMontantCaisse(Math.max(0, resteAPayer - montantPaiement))}
        </span>
      </p>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-texte-secondaire">
          {t("caisse.facturation.modePaiement")}
        </p>
        <div className="space-y-1.5">
          {MODES_PAIEMENT_UI_CAISSE.map((mode) => (
            <label
              key={mode.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                modeUi === mode.id
                  ? "border-bleu-medical bg-bleu-medical-clair/40"
                  : "border-gris-bordure hover:bg-gris-tres-clair"
              )}
            >
              <input
                type="radio"
                name="modePaiement"
                checked={modeUi === mode.id}
                onChange={() => setModeUi(mode.id)}
                className="accent-bleu-medical"
              />
              {t(`caisse.modesPaiement.${mode.id}`)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-texte-secondaire">
          {t("caisse.facturation.destination")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DESTINATIONS_APRES_ENCAISSEMENT.map((dest) => (
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
                : dest === "PHARMACIE"
                  ? t("caisse.facturation.destinationPharma")
                  : t("caisse.facturation.destinationAucune")}
            </button>
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
      <div className="mx-auto w-full max-w-7xl space-y-4">
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
            {/* Patient header */}
            <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bleu-medical text-sm font-bold text-white">
                  {initiales(dossier.prenom, dossier.nom)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-texte-principal">
                      {dossier.prenom} {dossier.nom}
                    </h2>
                    <span className="rounded-full bg-bleu-medical-clair/60 px-2.5 py-0.5 text-[11px] font-semibold text-bleu-medical">
                      {t("caisse.facturation.consultationNormale")}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        dossier.statutAttente === "EN_ATTENTE_PAIEMENT"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {dossier.statutAttente === "EN_ATTENTE_PAIEMENT"
                        ? t("caisse.facturation.enAttentePaiement")
                        : t("caisse.facturation.paye")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-texte-secondaire">
                    {dossier.numeroPatient}
                    {age != null ? ` · ${t("caisse.facturation.age", { age })}` : ""}
                    {dossier.sexe
                      ? ` · ${dossier.sexe === "FEMININ" ? "Féminin" : dossier.sexe === "MASCULIN" ? "Masculin" : dossier.sexe}`
                      : ""}
                    {dossier.telephone ? ` · ${dossier.telephone}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-gris-bordure px-3 py-2 text-xs font-semibold text-bleu-medical hover:bg-bleu-medical-clair/40"
                >
                  {t("caisse.facturation.voirDossier")}
                </button>
              </div>
            </section>

            {/* Mobile tabs */}
            <div className="flex gap-1 rounded-lg bg-gris-tres-clair p-1 lg:hidden">
              {(["prestations", "resume"] as const).map((onglet) => (
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
                  {onglet === "prestations"
                    ? t("caisse.facturation.ongletPrestations")
                    : t("caisse.facturation.ongletResume")}
                </button>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
              <div
                className={cn(
                  "space-y-4",
                  ongletMobile !== "prestations" && "hidden lg:block"
                )}
              >
                {/* Prestations table */}
                <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                  <div className="border-b border-gris-bordure px-4 py-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-texte-secondaire">
                      {t("caisse.facturation.detailPrestations")}
                    </h3>
                  </div>
                  {lignesVisibles.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                      {t("caisse.facturation.aucuneLigne")}
                    </p>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                            <tr>
                              <th className="px-3 py-2.5">{t("caisse.facturation.numero")}</th>
                              <th className="px-3 py-2.5">{t("caisse.facturation.prestation")}</th>
                              <th className="px-3 py-2.5">{t("caisse.facturation.description")}</th>
                              <th className="px-3 py-2.5 text-right">
                                {t("caisse.facturation.quantite")}
                              </th>
                              <th className="px-3 py-2.5 text-right">
                                {t("caisse.facturation.prixUnitaire")}
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
                                <td className="px-3 py-2.5 text-texte-secondaire">—</td>
                                <td className="px-3 py-2.5 text-right">{l.quantite}</td>
                                <td className="px-3 py-2.5 text-right">
                                  {formaterMontantCaisse(l.prixUnitaire)}
                                </td>
                                <td className="px-3 py-2.5 text-right font-semibold">
                                  {formaterMontantCaisse(l.montant)}
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
                      {/* Mobile cards */}
                      <ul className="divide-y divide-gris-bordure md:hidden">
                        {lignesVisibles.map((l) => (
                          <li
                            key={l.id}
                            className="flex items-start justify-between gap-2 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold">{l.libelle}</p>
                              <p className="text-xs text-texte-secondaire">
                                {l.quantite} × {formaterMontantCaisse(l.prixUnitaire)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold">
                                {formaterMontantCaisse(l.montant)}
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
                  <div className="border-t border-gris-bordure px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-bleu-medical hover:underline"
                    >
                      <Plus className="h-4 w-4" />
                      {t("caisse.facturation.ajouterPrestation")}
                    </button>
                  </div>
                </section>

                {/* Infos paiement */}
                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-texte-secondaire">
                    {t("caisse.facturation.infosPaiement")}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.numeroRecu")}
                      </span>
                      <input
                        readOnly
                        value={numeroRecu}
                        className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair/50 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.date")}
                      </span>
                      <input
                        readOnly
                        value={formaterDate(maintenant)}
                        className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair/50 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.heure")}
                      </span>
                      <input
                        readOnly
                        value={formaterHeure(maintenant.toISOString())}
                        className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair/50 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.caissier")}
                      </span>
                      <input
                        readOnly
                        value={`${utilisateur.prenom} ${utilisateur.nom}`}
                        className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair/50 px-3 py-2 text-sm capitalize"
                      />
                    </label>
                  </div>
                  <label className="mt-3 block text-sm">
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
                </section>
              </div>

              <div
                className={cn(
                  "space-y-4",
                  ongletMobile !== "resume" && "hidden lg:block"
                )}
              >
                {resumePanel}

                {/* Mobile payment modes icons */}
                <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm lg:hidden">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-texte-secondaire">
                    {t("caisse.facturation.modePaiement")}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {MODES_PAIEMENT_UI_CAISSE.map((mode) => {
                      const Icone = ICONES_MODE[mode.id];
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setModeUi(mode.id)}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-lg border p-2 text-[9px] font-medium",
                            modeUi === mode.id
                              ? "border-bleu-medical bg-bleu-medical text-white"
                              : "border-gris-bordure text-texte-secondaire"
                          )}
                        >
                          <Icone className="h-4 w-4" />
                          <span className="truncate">{t(`caisse.modesPaiement.${mode.id}`)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
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
              <Bouton
                type="button"
                variante="secondaire"
                onClick={() => void fetch("/api/caisse/factures", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ dossierId }),
                })}
              >
                {t("caisse.facturation.enregistrerBrouillon")}
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
                  <Wallet className="h-4 w-4" />
                )}
                {t("caisse.facturation.encaisserValider")}
              </Bouton>
            </div>

            {/* Sticky mobile CTA */}
            <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 border-t border-gris-bordure bg-white px-3 py-2.5 shadow-lg lg:hidden">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-texte-secondaire">{t("caisse.facturation.montantPaye")}</span>
                <span className="font-bold text-bleu-medical">
                  {formaterMontantCaisse(montantPaiement)}
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
                  <>
                    {t("caisse.facturation.encaisser")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Bouton>
            </div>

            {/* File d'attente bas */}
            <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              <div className="border-b border-gris-bordure px-4 py-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-texte-secondaire">
                  {t("caisse.facturation.patientsEnAttente", { count: file.length })}
                </h3>
              </div>
              {chargementFile ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-texte-secondaire" />
                </div>
              ) : file.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                  {t("caisse.patients.vide")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                      <tr>
                        <th className="px-4 py-2.5">{t("caisse.facturation.patient")}</th>
                        <th className="px-4 py-2.5">{t("caisse.patients.provenance")}</th>
                        <th className="px-4 py-2.5 text-right">
                          {t("caisse.facturation.prestation")}
                        </th>
                        <th className="px-4 py-2.5 text-right">
                          {t("caisse.patients.montantEstime")}
                        </th>
                        <th className="px-4 py-2.5">{t("caisse.patients.heure")}</th>
                        <th className="px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {file.map((p) => (
                        <tr
                          key={p.fileAttenteId}
                          className={cn(
                            "border-t border-gris-bordure",
                            p.dossierId === dossierId && "bg-bleu-medical-clair/20"
                          )}
                        >
                          <td className="px-4 py-2.5 font-medium">
                            {p.prenom} {p.nom}
                          </td>
                          <td className="px-4 py-2.5 text-texte-secondaire">
                            {p.motif ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right">{p.nombreExamens}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">
                            {formaterMontantCaisse(p.montantEstime)}
                          </td>
                          <td className="px-4 py-2.5 text-texte-secondaire">
                            {formaterHeure(p.arriveeLe)}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => ouvrirPatient(p.dossierId)}
                              className="rounded-lg bg-bleu-medical px-3 py-1.5 text-xs font-semibold text-white hover:bg-bleu-medical/90"
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
          </>
        )}
      </div>
    </MiseEnPageCaisse>
  );
}
