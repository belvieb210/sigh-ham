"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Calculator,
  Loader2,
  Pill,
  Printer,
  Save,
  Search,
} from "lucide-react";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import { EVENEMENT_MEDECINS_PATIENTS_MODIFIES } from "@/constants/medecins";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import {
  type DetailsImagerie,
  LignesMedicamentsOrdonnances,
  type LigneMedicamentDraft,
  nouvelleLigneMed,
  SectionImagerieOrdonnances,
  SelectionExamensOrdonnances,
} from "@/features/medecins/formulaire-ordonnances-blocs";
import { MenuActionsTransfertMedecins } from "@/features/medecins/menu-actions-transfert-medecins";
import {
  PanneauDroitMedecins,
  SectionsMobileMedecinsPatients,
} from "@/features/medecins/panneau-droit-medecins";
import { useSelectionMedecins } from "@/features/medecins/contexte-selection-medecins";
import { imprimerDevisEstimation } from "@/lib/reception/imprimer-devis-estimation";
import type {
  MedicamentMedecins,
  PatientFileMedecins,
  TypeExamenMedecins,
} from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurMedecins;
}

const IMAGERIE_VIDE: DetailsImagerie = {
  categories: [],
  autres: [""],
  typeExamen: "",
  but: "",
  conduiteATenir: "",
};

function formaterPrix(prix: number): string {
  return `$ ${prix.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function CorpsOrdonnances({ utilisateur }: Props) {
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
  const [catalogue, setCatalogue] = useState<MedicamentMedecins[]>([]);
  const [examens, setExamens] = useState<TypeExamenMedecins[]>([]);
  const [lignes, setLignes] = useState<LigneMedicamentDraft[]>([nouvelleLigneMed()]);
  const [imagerie, setImagerie] = useState<DetailsImagerie>(IMAGERIE_VIDE);
  const [patientNom, setPatientNom] = useState("");
  const [dateOrd, setDateOrd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [docteur, setDocteur] = useState(
    `${utilisateur.prenom} ${utilisateur.nom}`.trim()
  );
  const [remise, setRemise] = useState(0);
  const [modeEstimation, setModeEstimation] = useState(false);
  const [orienterPharmacie, setOrienterPharmacie] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [impression, setImpression] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const dossierId = patientSelectionne?.dossierId ?? "";

  const chargerPatients = useCallback(async () => {
    setChargement(true);
    try {
      const [resP, resM] = await Promise.all([
        fetch("/api/medecins/patients"),
        fetch("/api/medecins/medicaments"),
      ]);
      const dataP = (await resP.json()) as { patients?: PatientFileMedecins[] };
      const dataM = (await resM.json()) as { medicaments?: MedicamentMedecins[] };
      setPatients(dataP.patients ?? []);
      setCatalogue(dataM.medicaments ?? []);
    } catch {
      setErreur(t("medecins.ordonnances.erreur"));
    } finally {
      setChargement(false);
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

  useEffect(() => {
    if (!patientSelectionne) {
      setPatientNom("");
      return;
    }
    setPatientNom(
      `${patientSelectionne.nom.toUpperCase()} ${patientSelectionne.prenom}`
    );
  }, [patientSelectionne]);

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

  const totalExamens = examens.reduce((t, e) => t + e.prix, 0);
  const totalMeds = lignes
    .filter((l) => l.medicamentId)
    .reduce(
      (t, l) => t + l.prixUnitaire * Math.max(1, Number(l.quantite) || 1),
      0
    );
  const sousTotal = totalExamens + totalMeds;
  const remiseEff = Math.min(Math.max(0, remise), sousTotal);
  const totalNet = Math.max(0, sousTotal - remiseEff);

  const lignesApi = lignes
    .filter((l) => l.medicamentId)
    .map((l) => ({
      medicamentId: l.medicamentId,
      quantite: Math.max(1, Number(l.quantite) || 1),
      posologie: [l.dosage, l.frequence].filter(Boolean).join(" — ") || null,
      dureeJours: Number(l.duree) || null,
    }));

  async function enregistrer() {
    if (!dossierId) {
      setErreur("Sélectionnez un patient.");
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/medecins/ordonnances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          notes: imagerie.conduiteATenir || null,
          detailsPrescription: {
            imagerie,
            patient: patientNom,
            date: dateOrd,
            docteur,
          },
          typeExamenIds: examens.map((e) => e.id),
          lignes: lignesApi,
          orienterVersPharmacie: orienterPharmacie && lignesApi.length > 0,
        }),
      });
      const data = (await res.json()) as { erreur?: string };
      if (!res.ok) throw new Error(data.erreur ?? "Enregistrement impossible.");
      setMessage(t("medecins.ordonnances.creee"));
      setExamens([]);
      setLignes([nouvelleLigneMed()]);
      setImagerie(IMAGERIE_VIDE);
      setModeEstimation(false);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setEnCours(false);
    }
  }

  async function imprimerEstimation() {
    if (!patientSelectionne) {
      setErreur("Sélectionnez un patient.");
      return;
    }
    if (examens.length === 0 && lignesApi.length === 0) {
      setErreur("Ajoutez des examens et/ou des médicaments pour l'estimation.");
      return;
    }
    if (!docteur.trim()) {
      setErreur("Indiquez le médecin.");
      return;
    }
    setImpression(true);
    setErreur(null);
    try {
      const medsPdf = lignes
        .filter((l) => l.medicamentId)
        .map((l) => ({
          nom: l.nom,
          dosage: l.dosage,
          frequence: l.frequence,
          duree: l.duree,
          quantite: Math.max(1, Number(l.quantite) || 1),
          prixUnitaire: l.prixUnitaire,
          code: l.code,
        }));
      const ok = await imprimerDevisEstimation({
        examens: examens.map((e) => ({
          id: e.id,
          code: e.code,
          libelle: e.libelle,
          categorie: e.categorie,
          prix: e.prix,
          delaiHeures: e.delaiHeures,
        })),
        medicaments: medsPdf,
        medecinResponsable: docteur.trim(),
        nomPatient: patientSelectionne.nom,
        prenomPatient: patientSelectionne.prenom,
        telephonePatient:
          patientSelectionne.telephone === "—"
            ? ""
            : patientSelectionne.telephone,
        numeroEnregistrement: patientSelectionne.numeroDossier,
        dateEnregistrement: `${dateOrd} ${new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        agentNom: `${utilisateur.prenom} ${utilisateur.nom}`.trim(),
        remise: remiseEff,
        labels: {
          titreTicket: "ESTIMATION",
          numero: "N°",
          date: "Date",
          patient: "Patient",
          telephone: "Téléphone",
          medecin: "Médecin",
          description: "Description",
          prix: "Prix",
          total: "Total",
          genereLe: "Généré le",
          agent: "Émis par",
        },
      });
      if (!ok) setErreur("Impossible de générer le PDF.");
    } finally {
      setImpression(false);
    }
  }

  const tousCoches =
    filtrés.length > 0 &&
    filtrés.every((p) => dossiersCoches.includes(p.dossierId));

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-bleu-medical" />
          <h2 className="text-xl font-bold text-[#1a4d7c]">Ordonnances</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={enCours || !dossierId}
            onClick={() => void enregistrer()}
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
            disabled={!dossierId}
            onClick={() => setModeEstimation((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium",
              modeEstimation
                ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                : "border-gris-bordure"
            )}
          >
            <Calculator className="h-4 w-4" />
            Estimation
          </button>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {erreur ? <p className="text-sm text-red-600">{erreur}</p> : null}

      <div className="space-y-5 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-sky-600">
              Patient :
            </label>
            <input
              className="w-full rounded-md border border-sky-300/80 px-2.5 py-1.5 text-sm"
              value={patientNom}
              readOnly
              placeholder="Sélectionnez un patient ci-dessous"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-sky-600">
              Date :
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-sky-300/80 px-2.5 py-1.5 text-sm"
              value={dateOrd}
              onChange={(e) => setDateOrd(e.target.value)}
              disabled={!dossierId}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-sky-600">
              Docteur :
            </label>
            <input
              className="w-full rounded-md border border-sky-300/80 px-2.5 py-1.5 text-sm"
              value={docteur}
              onChange={(e) => setDocteur(e.target.value)}
              disabled={!dossierId}
              placeholder="— Choisir un médecin —"
            />
          </div>
        </div>

        <SelectionExamensOrdonnances
          selection={examens}
          onChange={setExamens}
          desactive={!dossierId}
        />

        <LignesMedicamentsOrdonnances
          lignes={lignes}
          onChange={setLignes}
          catalogue={catalogue}
          desactive={!dossierId}
        />

        <SectionImagerieOrdonnances
          value={imagerie}
          onChange={setImagerie}
          desactive={!dossierId}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={orienterPharmacie}
            onChange={(e) => setOrienterPharmacie(e.target.checked)}
            disabled={!dossierId}
          />
          Orienter vers la pharmacie après enregistrement des médicaments
        </label>
      </div>

      {modeEstimation ? (
        <div className="space-y-4 rounded-xl border border-bleu-medical/30 bg-bleu-medical-clair/20 p-4">
          <h3 className="text-sm font-bold uppercase text-[#1a4d7c]">
            Estimation
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gris-bordure bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-sky-700">
                Examens
              </p>
              {examens.length === 0 ? (
                <p className="text-xs text-texte-secondaire">Aucun examen.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {examens.map((e) => (
                    <li key={e.id} className="flex justify-between gap-2">
                      <span>
                        {e.code} — {e.libelle}
                      </span>
                      <span className="font-medium">{formaterPrix(e.prix)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 border-t border-gris-bordure pt-2 text-right text-sm font-bold">
                Sous-total : {formaterPrix(totalExamens)}
              </p>
            </div>
            <div className="rounded-lg border border-gris-bordure bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-sky-700">
                Médicaments
              </p>
              {lignesApi.length === 0 ? (
                <p className="text-xs text-texte-secondaire">Aucun médicament.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {lignes
                    .filter((l) => l.medicamentId)
                    .map((l) => (
                      <li key={l.key} className="flex justify-between gap-2">
                        <span>
                          {l.nom} × {l.quantite || 1}
                        </span>
                        <span className="font-medium">
                          {formaterPrix(
                            l.prixUnitaire * Math.max(1, Number(l.quantite) || 1)
                          )}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
              <p className="mt-2 border-t border-gris-bordure pt-2 text-right text-sm font-bold">
                Sous-total : {formaterPrix(totalMeds)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-sky-700">
                Remise ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={remise}
                onChange={(e) => setRemise(Number(e.target.value) || 0)}
                className="w-28 rounded-md border border-sky-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="rounded-lg border border-gris-bordure bg-white px-4 py-3 text-sm">
              <div className="flex justify-between gap-8">
                <span>Sous-total</span>
                <span>{formaterPrix(sousTotal)}</span>
              </div>
              <div className="flex justify-between gap-8 text-texte-secondaire">
                <span>Remise</span>
                <span>- {formaterPrix(remiseEff)}</span>
              </div>
              <div className="mt-1 flex justify-between gap-8 border-t border-gris-bordure pt-1 font-bold text-bleu-medical">
                <span>Total net</span>
                <span>{formaterPrix(totalNet)}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={impression}
              onClick={() => void imprimerEstimation()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm font-medium"
            >
              {impression ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              PDF estimation
            </button>
          </div>
        </div>
      ) : null}

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

        {chargement ? (
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
              <thead className="border-b border-gris-bordure bg-gris-tres-clair/60 text-xs uppercase text-texte-secondaire">
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
                  <th className="px-3 py-3">Patient</th>
                  <th className="hidden px-3 py-3 md:table-cell">Téléphone</th>
                  <th className="px-3 py-3">Orientation</th>
                  <th className="px-3 py-3">Statut</th>
                  <th className="px-3 py-3">Heure</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtrés.map((p) => {
                  const sel = patientSelectionne?.dossierId === p.dossierId;
                  return (
                    <tr
                      key={p.cleListe}
                      onClick={() => selectionnerPatient(p)}
                      className={cn(
                        "cursor-pointer border-b border-gris-bordure/70 hover:bg-bleu-medical-clair/20",
                        sel && "bg-bleu-medical-clair/40"
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
                      <td className="px-3 py-3 font-mono text-[11px]">
                        {p.numeroPatient}
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-bold uppercase">{p.nom}</span>{" "}
                        <span className="lowercase">{p.prenom}</span>
                      </td>
                      <td className="hidden px-3 py-3 md:table-cell">
                        {p.telephone}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            p.orientationCouleur
                          )}
                        >
                          {p.orientation}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            p.statutCouleur
                          )}
                        >
                          {p.statut}
                        </span>
                      </td>
                      <td className="px-3 py-3">{p.heure}</td>
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

export function ContenuOrdonnancesMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.ordonnances.titre")}
      sousTitre={t("medecins.ordonnances.sousTitre")}
      panneauDroit={<PanneauDroitMedecins />}
      activerSelection
    >
      <CorpsOrdonnances utilisateur={utilisateur} />
    </MiseEnPageMedecins>
  );
}
