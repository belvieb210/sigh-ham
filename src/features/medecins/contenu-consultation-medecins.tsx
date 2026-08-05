"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  Pencil,
  Save,
  Search,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import { EVENEMENT_MEDECINS_PATIENTS_MODIFIES } from "@/constants/medecins";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import {
  FORMULAIRE_VIDE,
  FormulaireConsultationClinique,
  signesDepuisConstantes,
  synthetiserChampsTexte,
} from "@/features/medecins/formulaire-consultation-clinique";
import { MenuActionsTransfertMedecins } from "@/features/medecins/menu-actions-transfert-medecins";
import {
  PanneauDroitMedecins,
  SectionsMobileMedecinsPatients,
} from "@/features/medecins/panneau-droit-medecins";
import { useSelectionMedecins } from "@/features/medecins/contexte-selection-medecins";
import type {
  ConsultationDetailMedecins,
  ConstanteVitaleResume,
  FormulaireCliniqueMedecins,
  PatientFileMedecins,
} from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurMedecins;
}

function aujourdhuiInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CorpsConsultation({ utilisateur }: Props) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier")?.trim() ?? "";

  const {
    patientSelectionne,
    selectionnerPatient,
    dossiersCoches,
    basculerDossierCoche,
    definirCoches,
    synchroniserSelection,
  } = useSelectionMedecins();

  const [patients, setPatients] = useState<PatientFileMedecins[]>([]);
  const [chargementListe, setChargementListe] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [consultation, setConsultation] =
    useState<ConsultationDetailMedecins | null>(null);
  const [historique, setHistorique] = useState<ConsultationDetailMedecins[]>(
    []
  );
  const [constantes, setConstantes] = useState<ConstanteVitaleResume | null>(
    null
  );
  const [motif, setMotif] = useState("");
  const [formulaire, setFormulaire] =
    useState<FormulaireCliniqueMedecins>(FORMULAIRE_VIDE);
  const [dateConsult, setDateConsult] = useState(aujourdhuiInput());
  const [modeModifier, setModeModifier] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const dossierId = patientSelectionne?.dossierId ?? "";

  const chargerPatients = useCallback(async () => {
    setChargementListe(true);
    try {
      const res = await fetch("/api/medecins/patients");
      const data = (await res.json()) as {
        patients?: PatientFileMedecins[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("medecins.erreurs.chargementPatients"));
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("medecins.erreurs.chargementPatients"));
    } finally {
      setChargementListe(false);
    }
  }, [t]);

  useEffect(() => {
    void chargerPatients();
  }, [chargerPatients]);

  useEffect(() => {
    const onModifie = () => void chargerPatients();
    window.addEventListener(EVENEMENT_MEDECINS_PATIENTS_MODIFIES, onModifie);
    return () =>
      window.removeEventListener(EVENEMENT_MEDECINS_PATIENTS_MODIFIES, onModifie);
  }, [chargerPatients]);

  useEffect(() => {
    synchroniserSelection(patients);
  }, [patients, synchroniserSelection]);

  useEffect(() => {
    if (!dossierUrl || patients.length === 0) return;
    const p = patients.find((x) => x.dossierId === dossierUrl);
    if (p) selectionnerPatient(p);
  }, [dossierUrl, patients, selectionnerPatient]);

  const reinitaliserFormulaire = useCallback(
    (opts?: {
      patient?: PatientFileMedecins | null;
      constantes?: ConstanteVitaleResume | null;
      consultation?: ConsultationDetailMedecins | null;
      medecinNom?: string;
    }) => {
      const c = opts?.consultation ?? null;
      const patient = opts?.patient;
      const constantesLocal = opts?.constantes ?? null;
      if (c) {
        setConsultation(c);
        setMotif(c.motif);
        setFormulaire({
          ...FORMULAIRE_VIDE,
          ...(c.formulaireClinique ?? {}),
          signesVitaux: {
            ...signesDepuisConstantes(constantesLocal),
            ...(c.formulaireClinique?.signesVitaux ?? {}),
          },
          drRef: c.formulaireClinique?.drRef || opts?.medecinNom || c.medecin,
        });
        setDateConsult(c.debutLe.slice(0, 10));
        return;
      }
      setConsultation(null);
      setMotif(patient?.motif && patient.motif !== "—" ? patient.motif : "");
      setFormulaire({
        ...FORMULAIRE_VIDE,
        drRef: opts?.medecinNom ?? "",
        signesVitaux: signesDepuisConstantes(constantesLocal),
      });
      setDateConsult(aujourdhuiInput());
    },
    []
  );

  useEffect(() => {
    if (!dossierId) {
      reinitaliserFormulaire();
      setConstantes(null);
      setHistorique([]);
      setModeModifier(false);
      return;
    }

    let annule = false;
    (async () => {
      setErreur(null);
      try {
        const [resConsult, resDetail] = await Promise.all([
          fetch(
            `/api/medecins/consultations?dossierId=${encodeURIComponent(dossierId)}`
          ),
          fetch(`/api/medecins/patients/${encodeURIComponent(dossierId)}`),
        ]);
        const dataConsult = (await resConsult.json()) as {
          consultation?: ConsultationDetailMedecins | null;
          historique?: ConsultationDetailMedecins[];
        };
        const dataDetail = (await resDetail.json()) as {
          patient?: {
            constantesVitales?: ConstanteVitaleResume | null;
            motif?: string;
          };
        };
        if (annule) return;
        const constantesLocal = dataDetail.patient?.constantesVitales ?? null;
        setConstantes(constantesLocal);
        setHistorique(dataConsult.historique ?? []);
        setModeModifier(false);
        reinitaliserFormulaire({
          patient: patientSelectionne,
          constantes: constantesLocal,
          consultation: dataConsult.consultation ?? null,
          medecinNom: `${utilisateur.prenom} ${utilisateur.nom}`.trim(),
        });
      } catch {
        if (!annule) setErreur(t("medecins.consultation.erreurChargement"));
      }
    })();

    return () => {
      annule = true;
    };
  }, [
    dossierId,
    patientSelectionne,
    reinitaliserFormulaire,
    t,
    utilisateur.nom,
    utilisateur.prenom,
  ]);

  const filtrés = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      [p.nomComplet, p.telephone, p.numeroDossier, p.numeroPatient, p.motif]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [patients, recherche]);

  const tousCoches =
    filtrés.length > 0 && filtrés.every((p) => dossiersCoches.includes(p.dossierId));

  async function sauvegarder() {
    if (!dossierId) {
      setErreur("Sélectionnez un patient.");
      return;
    }
    if (!motif.trim()) {
      setErreur("Le motif de consultation est requis.");
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    const { anamnese, examenClinique, conclusion } =
      synthetiserChampsTexte(formulaire);
    try {
      if (consultation) {
        const res = await fetch(
          `/api/medecins/consultations/${encodeURIComponent(consultation.id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              motif,
              anamnese,
              examenClinique,
              conclusion,
              formulaireClinique: formulaire,
              autoriserCloturee: Boolean(consultation.finLe),
            }),
          }
        );
        const data = (await res.json()) as {
          consultation?: ConsultationDetailMedecins;
          erreur?: string;
        };
        if (!res.ok || !data.consultation) {
          throw new Error(data.erreur ?? "Enregistrement impossible.");
        }
        setConsultation(data.consultation);
        setMessage(t("medecins.consultation.enregistree"));
      } else {
        const res = await fetch("/api/medecins/consultations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dossierId,
            motif,
            anamnese,
            examenClinique,
            conclusion,
            formulaireClinique: formulaire,
          }),
        });
        const data = (await res.json()) as {
          consultation?: ConsultationDetailMedecins;
          erreur?: string;
        };
        if (!res.ok || !data.consultation) {
          throw new Error(data.erreur ?? "Enregistrement impossible.");
        }
        setConsultation(data.consultation);
        setMessage(t("medecins.consultation.enregistree"));
      }
      const histRes = await fetch(
        `/api/medecins/consultations?dossierId=${encodeURIComponent(dossierId)}`
      );
      const histData = (await histRes.json()) as {
        historique?: ConsultationDetailMedecins[];
      };
      setHistorique(histData.historique ?? []);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur d'enregistrement.");
    } finally {
      setEnCours(false);
    }
  }

  async function cloturer() {
    if (!consultation) return;
    setEnCours(true);
    setErreur(null);
    try {
      const res = await fetch(
        `/api/medecins/consultations/${encodeURIComponent(consultation.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cloturer" }),
        }
      );
      const data = (await res.json()) as {
        consultation?: ConsultationDetailMedecins;
        erreur?: string;
      };
      if (!res.ok || !data.consultation) {
        throw new Error(data.erreur ?? "Clôture impossible.");
      }
      setConsultation(data.consultation);
      setMessage(t("medecins.consultation.cloturee"));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur de clôture.");
    } finally {
      setEnCours(false);
    }
  }

  const chargerHistorique = (c: ConsultationDetailMedecins) => {
    reinitaliserFormulaire({
      patient: patientSelectionne,
      constantes,
      consultation: c,
      medecinNom: c.medecin,
    });
    setModeModifier(true);
    setMessage(`Consultation du ${new Date(c.debutLe).toLocaleString("fr-FR")} chargée.`);
  };

  const identite = {
    nom: patientSelectionne
      ? `${patientSelectionne.nom.toUpperCase()} ${patientSelectionne.prenom}`
      : "",
    age: patientSelectionne?.age != null ? String(patientSelectionne.age) : "",
    sexe: patientSelectionne?.sexe ?? "",
    date: dateConsult,
    telPat: patientSelectionne?.telephone === "—" ? "" : patientSelectionne?.telephone ?? "",
    numeroEnreg: patientSelectionne?.numeroDossier ?? "",
    lectureSeuleIdentite: true as const,
    onChangeIdentite: (champ: string, v: string) => {
      if (champ === "date") setDateConsult(v);
    },
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-bleu-medical" />
            <h2 className="text-xl font-bold text-texte-principal">
              {t("medecins.consultation.titre")}
            </h2>
          </div>
            <p className="mt-1 text-sm text-texte-secondaire">
              {patientSelectionne
                ? `Patient : ${patientSelectionne.nomComplet}`
                : "Sélectionnez un patient dans la liste ci-dessous."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={enCours || !dossierId}
              onClick={() => void sauvegarder()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-bleu-medical px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {enCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
            <button
              type="button"
              disabled={!dossierId || historique.length === 0}
              onClick={() => setModeModifier((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium",
                modeModifier
                  ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                  : "border-gris-bordure text-texte-principal hover:bg-gris-tres-clair"
              )}
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
            {consultation && !consultation.finLe ? (
              <button
                type="button"
                disabled={enCours}
                onClick={() => void cloturer()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                Clôturer
              </button>
            ) : null}
          </div>
        </div>

        {message ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        ) : null}
        {erreur ? <p className="text-sm text-red-600">{erreur}</p> : null}

        {modeModifier && historique.length > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-amber-900">
              Consultations enregistrées — cliquez pour charger dans le formulaire
            </p>
            <ul className="flex flex-wrap gap-2">
              {historique.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => chargerHistorique(h)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-xs font-medium",
                      consultation?.id === h.id
                        ? "border-bleu-medical bg-white text-bleu-medical"
                        : "border-amber-200 bg-white text-texte-principal hover:border-bleu-medical"
                    )}
                  >
                    {new Date(h.debutLe).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {h.finLe ? " · clôturée" : " · ouverte"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <FormulaireConsultationClinique
          formulaire={formulaire}
          onChange={setFormulaire}
          motif={motif}
          onMotifChange={setMotif}
          identite={identite}
          desactive={!dossierId}
        />

        {/* Liste patients (image 6) */}
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
              Patients récemment enregistrés
            </h3>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
              <input
                type="search"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder={t("medecins.patients.recherche")}
                className="w-full rounded-xl border border-gris-bordure bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-bleu-medical"
              />
            </div>
          </div>

          {chargementListe ? (
            <div className="flex items-center gap-2 text-sm text-texte-secondaire">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("medecins.patients.chargement")}
            </div>
          ) : filtrés.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-8 text-center text-sm text-texte-secondaire">
              {t("medecins.patients.vide")}
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gris-bordure bg-gris-tres-clair/60 text-xs uppercase tracking-wide text-texte-secondaire">
                  <tr>
                    <th className="px-3 py-3">
                      <CaseCocheLigne
                        coche={tousCoches}
                        onChange={(coche) =>
                          definirCoches(
                            filtrés.map((p) => p.dossierId),
                            coche
                          )
                        }
                        ariaLabel={t("medecins.patients.selectionnerTout")}
                      />
                    </th>
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">
                      {t("medecins.patients.colonnes.patient")}
                    </th>
                    <th className="hidden px-3 py-3 md:table-cell">
                      {t("medecins.patients.colonnes.telephone")}
                    </th>
                    <th className="hidden px-3 py-3 lg:table-cell">
                      {t("medecins.patients.colonnes.motif")}
                    </th>
                    <th className="px-3 py-3">
                      {t("medecins.patients.colonnes.orientation")}
                    </th>
                    <th className="px-3 py-3">
                      {t("medecins.patients.colonnes.statut")}
                    </th>
                    <th className="px-3 py-3">
                      {t("medecins.patients.colonnes.heure")}
                    </th>
                    <th className="px-3 py-3">
                      {t("medecins.patients.colonnes.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtrés.map((p) => {
                    const selectionne =
                      patientSelectionne?.dossierId === p.dossierId;
                    return (
                      <tr
                        key={p.cleListe}
                        onClick={() => selectionnerPatient(p)}
                        className={cn(
                          "cursor-pointer border-b border-gris-bordure/70 hover:bg-bleu-medical-clair/20",
                          selectionne && "bg-bleu-medical-clair/40"
                        )}
                      >
                        <td
                          className="px-3 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CaseCocheLigne
                            coche={dossiersCoches.includes(p.dossierId)}
                            onChange={() => basculerDossierCoche(p.dossierId)}
                            ariaLabel={p.nomComplet}
                          />
                        </td>
                        <td className="px-3 py-3 font-mono text-[11px] text-texte-secondaire">
                          {p.numeroPatient}
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-bold uppercase">{p.nom}</span>{" "}
                          <span className="lowercase">{p.prenom}</span>
                        </td>
                        <td className="hidden px-3 py-3 text-texte-secondaire md:table-cell">
                          {p.telephone}
                        </td>
                        <td className="hidden max-w-[9rem] truncate px-3 py-3 text-texte-secondaire lg:table-cell">
                          {p.motif}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                              p.orientationCouleur
                            )}
                          >
                            {p.orientation}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                              p.statutCouleur
                            )}
                          >
                            {p.statut}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-texte-secondaire">
                          {p.heure}
                        </td>
                        <td
                          className="px-3 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MenuActionsTransfertMedecins
                            patient={p}
                            onRafraichir={chargerPatients}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <SectionsMobileMedecinsPatients />
        </section>
      </div>
  );
}

export function ContenuConsultationMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.consultation.titre")}
      sousTitre={t("medecins.consultation.sousTitre")}
      panneauDroit={<PanneauDroitMedecins />}
      activerSelection
    >
      <CorpsConsultation utilisateur={utilisateur} />
    </MiseEnPageMedecins>
  );
}
