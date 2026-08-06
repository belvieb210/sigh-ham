"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  NotebookPen,
  Pill,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";
import { BoutonsOutilsListe } from "@/components/ui/boutons-outils-liste";
import { PaginationListe } from "@/components/ui/pagination-liste";
import {
  compterFiltresActifs,
  FILTRES_FACTURATION_VIDES,
  FormulaireFiltresFacturationCaisse,
  type FiltresFacturationCaisse,
} from "@/features/caisse/formulaire-filtres-facturation-caisse";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import {
  ModalHistoriquePatientMedecins,
  type PatientHistoriqueCible,
} from "@/features/medecins/modal-historique-patient-medecins";
import { PanneauDroitMedecins } from "@/features/medecins/panneau-droit-medecins";
import {
  imprimerCrConsultation,
  imprimerOrdonnancePdf,
} from "@/lib/medecins/imprimer-pdfs-medecins";
import {
  consultationVersDonneesPdf,
  ordonnanceVersDonneesPdf,
} from "@/lib/medecins/pdf-donnees-medecins";
import type {
  ConsultationDetailMedecins,
  ConstanteVitaleResume,
  DossierNotesMedecins,
  OrdonnanceMedecins,
} from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurMedecins;
}

const PAR_PAGE = 12;

function correspondFiltres(d: DossierNotesMedecins, f: FiltresFacturationCaisse) {
  const nom = f.nom.trim().toLowerCase();
  const prenom = f.prenom.trim().toLowerCase();
  const tel = f.telephone.trim().toLowerCase();
  const enreg = f.numeroEnreg.trim().toLowerCase();
  const idEntite = f.idEntite.trim().toLowerCase();
  if (nom && !d.nomComplet.toLowerCase().includes(nom)) return false;
  if (prenom && !d.nomComplet.toLowerCase().includes(prenom)) return false;
  if (tel && !(d.telephone || "").toLowerCase().includes(tel)) return false;
  if (enreg && !(d.numeroDossier || "").toLowerCase().includes(enreg)) return false;
  if (idEntite && !(d.dossierId || "").toLowerCase().includes(idEntite)) return false;
  return true;
}

export function ContenuNotesMedecins({ utilisateur }: Props) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dossierIdParam = searchParams.get("dossierId")?.trim() || null;
  const deepLinkTraite = useRef<string | null>(null);
  const [dossiers, setDossiers] = useState<DossierNotesMedecins[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState(FILTRES_FACTURATION_VIDES);
  const [filtresAppliques, setFiltresAppliques] = useState(FILTRES_FACTURATION_VIDES);
  const [page, setPage] = useState(1);
  const [ouverts, setOuverts] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<string[]>([]);
  const [pdfEnCours, setPdfEnCours] = useState<string | null>(null);
  const [historiquePatient, setHistoriquePatient] =
    useState<PatientHistoriqueCible | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/medecins/notes");
      const data = (await res.json()) as {
        dossiers?: DossierNotesMedecins[];
        erreur?: string;
      };
      if (!res.ok || !data.dossiers) {
        setErreur(data.erreur ?? t("medecins.notes.erreur"));
        return;
      }
      setDossiers(data.dossiers);
    } catch {
      setErreur(t("medecins.notes.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    if (!dossierIdParam || chargement || dossiers.length === 0) return;
    if (deepLinkTraite.current === dossierIdParam) return;
    const cible = dossiers.find((d) => d.dossierId === dossierIdParam);
    if (!cible) return;
    deepLinkTraite.current = dossierIdParam;
    const idx = dossiers.findIndex((d) => d.dossierId === dossierIdParam);
    if (idx >= 0) setPage(Math.floor(idx / PAR_PAGE) + 1);
    setOuverts((prev) => new Set(prev).add(cible.dossierId));
    setHistoriquePatient({
      dossierId: cible.dossierId,
      nomComplet: cible.nomComplet,
      numeroDossier: cible.numeroDossier,
      telephone: cible.telephone,
    });
  }, [dossierIdParam, chargement, dossiers]);

  const filtrés = useMemo(
    () => dossiers.filter((d) => correspondFiltres(d, filtresAppliques)),
    [dossiers, filtresAppliques]
  );

  useEffect(() => {
    setPage(1);
  }, [filtresAppliques]);

  const nbFiltres = compterFiltresActifs(filtresAppliques, {
    ignorerNumeroFacture: true,
  });
  const totalPages = Math.max(1, Math.ceil(filtrés.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const pageDossiers = filtrés.slice(debut, debut + PAR_PAGE);
  const tousCoches =
    pageDossiers.length > 0 &&
    pageDossiers.every((d) => selection.includes(d.dossierId));

  const formater = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language || "fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const basculer = (id: string) => {
    setOuverts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function pdfConsultationId(dossierId: string, consultationId: string) {
    setPdfEnCours(consultationId);
    setErreur(null);
    try {
      const res = await fetch(
        `/api/medecins/consultations?dossierId=${encodeURIComponent(dossierId)}`
      );
      const data = (await res.json()) as {
        historique?: ConsultationDetailMedecins[];
        consultation?: ConsultationDetailMedecins | null;
        constantesVitales?: ConstanteVitaleResume | null;
      };
      const c =
        data.historique?.find((x) => x.id === consultationId) ??
        (data.consultation?.id === consultationId ? data.consultation : null);
      if (!c) throw new Error("Consultation introuvable.");
      const ok = await imprimerCrConsultation(
        consultationVersDonneesPdf(c, {
          constantesVitales: data.constantesVitales,
        })
      );
      if (!ok) throw new Error("PDF consultation impossible.");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur PDF.");
    } finally {
      setPdfEnCours(null);
    }
  }

  async function pdfOrdonnanceId(dossierId: string, ordonnanceId: string) {
    setPdfEnCours(ordonnanceId);
    setErreur(null);
    try {
      const [resO, resC] = await Promise.all([
        fetch(
          `/api/medecins/ordonnances?dossierId=${encodeURIComponent(dossierId)}`
        ),
        fetch(
          `/api/medecins/consultations?dossierId=${encodeURIComponent(dossierId)}`
        ),
      ]);
      const data = (await resO.json()) as { ordonnances?: OrdonnanceMedecins[] };
      const dataC = (await resC.json()) as {
        historique?: ConsultationDetailMedecins[];
        consultation?: ConsultationDetailMedecins | null;
        constantesVitales?: ConstanteVitaleResume | null;
      };
      const o = data.ordonnances?.find((x) => x.id === ordonnanceId);
      if (!o) throw new Error("Ordonnance introuvable.");
      const dossier = dossiers.find((d) => d.dossierId === dossierId);
      const ref = dataC.consultation ?? dataC.historique?.[0];
      const ok = await imprimerOrdonnancePdf(
        ordonnanceVersDonneesPdf(o, {
          telephone: dossier?.telephone,
          age: ref?.patient.age,
          sexe: ref?.patient.sexe,
          constantesVitales: dataC.constantesVitales,
          signesVitauxConsultation: ref?.formulaireClinique?.signesVitaux,
        })
      );
      if (!ok) throw new Error("PDF ordonnance impossible.");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur PDF.");
    } finally {
      setPdfEnCours(null);
    }
  }

  function fermerHistorique() {
    setHistoriquePatient(null);
    if (dossierIdParam) {
      router.replace("/sigh/medecins/notes", { scroll: false });
      deepLinkTraite.current = null;
    }
  }

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.notes.titre")}
      sousTitre={t("medecins.notes.sousTitre")}
      panneauDroit={<PanneauDroitMedecins />}
      activerSelection
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <NotebookPen className="h-5 w-5 text-bleu-medical" />
              <h2 className="text-xl font-bold text-texte-principal">
                Notes médicales
              </h2>
            </div>
            <p className="mt-1 text-sm text-texte-secondaire">
              Dossiers patients — consultations et ordonnances consultables.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFiltresOuverts((o) => !o)}
              className={cn(
                "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
                filtresOuverts
                  ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                  : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
              )}
            >
              <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
              <span
                className={cn(
                  "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                  nbFiltres > 0 ? "bg-red-500" : "bg-slate-400"
                )}
              >
                {nbFiltres}
              </span>
            </button>
            <BoutonsOutilsListe
              toutSelectionne={tousCoches}
              onSelectionnerTout={() => {
                const ids = pageDossiers.map((d) => d.dossierId);
                setSelection((prev) =>
                  tousCoches
                    ? prev.filter((id) => !ids.includes(id))
                    : [...new Set([...prev, ...ids])]
                );
              }}
              onExporter={() => {
                const ids = selection.length
                  ? selection
                  : filtrés.map((d) => d.dossierId);
                const rows = dossiers.filter((d) => ids.includes(d.dossierId));
                const csv = [
                  "dossier;patient;telephone;consultations;ordonnances",
                  ...rows.map(
                    (d) =>
                      `${d.numeroDossier};${d.nomComplet};${d.telephone};${d.consultations.length};${d.ordonnances.length}`
                  ),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "notes-medicales.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              labelSelectionnerTout={t("medecins.patients.selectionnerTout")}
              labelExporter={t("caisse.transferts.exporterSelection")}
            />
          </div>
        </div>

        {filtresOuverts ? (
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
            }}
            idPrefix="filtre-notes"
            masquerNumeroFacture
          />
        ) : null}

        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.notes.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : filtrés.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-8 text-center text-sm text-texte-secondaire">
            {nbFiltres > 0
              ? t("caisse.facturation.filtres.aucunResultat")
              : t("medecins.notes.vide")}
          </p>
        ) : (
          <div className="space-y-3">
            <ul className="space-y-2">
              {pageDossiers.map((d) => {
                const estOuvert = ouverts.has(d.dossierId);
                return (
                  <li
                    key={d.dossierId}
                    className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => basculer(d.dossierId)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gris-tres-clair/40"
                    >
                      {estOuvert ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-bleu-medical" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-texte-secondaire" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-texte-principal">
                          {d.nomComplet}
                        </p>
                        <p className="text-xs text-texte-secondaire">
                          {d.numeroDossier}
                          {d.telephone ? ` · ${d.telephone}` : ""}
                          {" · "}
                          {d.consultations.length} consultation
                          {d.consultations.length !== 1 ? "s" : ""}
                          {" · "}
                          {d.ordonnances.length} ordonnance
                          {d.ordonnances.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div
                        className="flex shrink-0 gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setHistoriquePatient({
                              dossierId: d.dossierId,
                              nomComplet: d.nomComplet,
                              numeroDossier: d.numeroDossier,
                              telephone: d.telephone,
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-bleu-medical px-2.5 py-1.5 text-xs font-medium text-white"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Voir
                        </button>
                      </div>
                    </button>

                    {estOuvert ? (
                      <div className="grid gap-4 border-t border-gris-bordure bg-gris-tres-clair/30 px-4 py-3 md:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                            Consultations
                          </p>
                          {d.consultations.length === 0 ? (
                            <p className="text-xs text-texte-secondaire">
                              Aucune consultation.
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {d.consultations.map((c) => (
                                <li
                                  key={c.id}
                                  className="rounded-lg border border-gris-bordure bg-white px-3 py-2"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-medium text-texte-principal">
                                        {c.motif || "Consultation"}
                                      </p>
                                      <p className="text-xs text-texte-secondaire">
                                        {formater(c.debutLe)} · {c.medecin}
                                        {c.finLe ? " · clôturée" : " · ouverte"}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      disabled={pdfEnCours === c.id}
                                      onClick={() =>
                                        void pdfConsultationId(d.dossierId, c.id)
                                      }
                                      className="inline-flex items-center gap-1 text-xs font-medium text-bleu-medical hover:underline disabled:opacity-50"
                                    >
                                      {pdfEnCours === c.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Stethoscope className="h-3.5 w-3.5" />
                                      )}
                                      PDF
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                            Ordonnances
                          </p>
                          {d.ordonnances.length === 0 ? (
                            <p className="text-xs text-texte-secondaire">
                              Aucune ordonnance.
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {d.ordonnances.map((o) => (
                                <li
                                  key={o.id}
                                  className="rounded-lg border border-gris-bordure bg-white px-3 py-2"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-medium text-texte-principal">
                                        Ordonnance
                                      </p>
                                      <p className="text-xs text-texte-secondaire">
                                        {formater(o.prescritLe)} · {o.medecin}
                                      </p>
                                      {o.notes ? (
                                        <p className="mt-1 line-clamp-2 text-xs text-texte-principal">
                                          {o.notes}
                                        </p>
                                      ) : null}
                                    </div>
                                    <button
                                      type="button"
                                      disabled={pdfEnCours === o.id}
                                      onClick={() =>
                                        void pdfOrdonnanceId(d.dossierId, o.id)
                                      }
                                      className="inline-flex items-center gap-1 text-xs font-medium text-bleu-medical hover:underline disabled:opacity-50"
                                    >
                                      {pdfEnCours === o.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Pill className="h-3.5 w-3.5" />
                                      )}
                                      PDF
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white">
              <PaginationListe
                page={pageCourante}
                totalPages={totalPages}
                totalItems={filtrés.length}
                parPage={PAR_PAGE}
                onChange={setPage}
              />
            </div>
          </div>
        )}
      </div>

      <ModalHistoriquePatientMedecins
        patient={historiquePatient}
        onFermer={fermerHistorique}
      />
    </MiseEnPageMedecins>
  );
}
