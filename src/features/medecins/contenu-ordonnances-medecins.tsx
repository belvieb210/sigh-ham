"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type {
  MedicamentMedecins,
  OrdonnanceMedecins,
  PatientFileMedecins,
} from "@/lib/medecins/types";

interface LigneDraft {
  key: string;
  medicamentId: string;
  quantite: number;
  posologie: string;
  dureeJours: string;
}

interface Props {
  utilisateur: UtilisateurMedecins;
}

export function ContenuOrdonnancesMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier")?.trim() ?? "";

  const [patients, setPatients] = useState<PatientFileMedecins[]>([]);
  const [medicaments, setMedicaments] = useState<MedicamentMedecins[]>([]);
  const [ordonnances, setOrdonnances] = useState<OrdonnanceMedecins[]>([]);
  const [dossierId, setDossierId] = useState(dossierUrl);
  const [lignes, setLignes] = useState<LigneDraft[]>([
    { key: "1", medicamentId: "", quantite: 1, posologie: "", dureeJours: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (dossierUrl) setDossierId(dossierUrl);
  }, [dossierUrl]);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const [resP, resM] = await Promise.all([
          fetch("/api/medecins/patients"),
          fetch("/api/medecins/medicaments"),
        ]);
        const dataP = (await resP.json()) as { patients?: PatientFileMedecins[] };
        const dataM = (await resM.json()) as {
          medicaments?: MedicamentMedecins[];
        };
        if (annule) return;
        setPatients(dataP.patients ?? []);
        setMedicaments(dataM.medicaments ?? []);
      } catch {
        if (!annule) setErreur(t("medecins.ordonnances.erreur"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [t]);

  useEffect(() => {
    let annule = false;
    (async () => {
      const qs = dossierId
        ? `?dossierId=${encodeURIComponent(dossierId)}`
        : "";
      const res = await fetch(`/api/medecins/ordonnances${qs}`);
      const data = (await res.json()) as { ordonnances?: OrdonnanceMedecins[] };
      if (!annule) setOrdonnances(data.ordonnances ?? []);
    })();
    return () => {
      annule = true;
    };
  }, [dossierId]);

  async function creer() {
    if (!dossierId) {
      setErreur(t("medecins.consultation.aideSelection"));
      return;
    }
    const payload = lignes
      .filter((l) => l.medicamentId)
      .map((l) => ({
        medicamentId: l.medicamentId,
        quantite: l.quantite,
        posologie: l.posologie || null,
        dureeJours: l.dureeJours ? Number(l.dureeJours) : null,
      }));
    if (payload.length === 0) {
      setErreur(t("medecins.ordonnances.lignesRequises"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/medecins/ordonnances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId, notes, lignes: payload }),
      });
      const data = (await res.json()) as {
        ordonnance?: OrdonnanceMedecins;
        erreur?: string;
      };
      if (!res.ok || !data.ordonnance) {
        setErreur(data.erreur ?? t("medecins.actions.erreurInattendue"));
        return;
      }
      setOrdonnances((prev) => [data.ordonnance!, ...prev]);
      setLignes([
        { key: String(Date.now()), medicamentId: "", quantite: 1, posologie: "", dureeJours: "" },
      ]);
      setNotes("");
      setMessage(t("medecins.ordonnances.creee"));
    } catch {
      setErreur(t("medecins.actions.erreurInattendue"));
    } finally {
      setEnCours(false);
    }
  }

  const champ =
    "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm outline-none focus:border-bleu-medical";

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.ordonnances.titre")}
      sousTitre={t("medecins.ordonnances.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-5">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.ordonnances.chargement")}
          </div>
        ) : (
          <>
            <select
              className={champ}
              value={dossierId}
              onChange={(e) => setDossierId(e.target.value)}
            >
              <option value="">{t("medecins.consultation.choisirPatient")}</option>
              {patients.map((p) => (
                <option key={p.dossierId} value={p.dossierId}>
                  {p.nomComplet} — {p.numeroDossier}
                </option>
              ))}
            </select>

            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold">
                {t("medecins.ordonnances.nouvelle")}
              </h3>
              <div className="mt-3 space-y-3">
                {lignes.map((ligne, idx) => (
                  <div
                    key={ligne.key}
                    className="grid gap-2 md:grid-cols-[1fr_80px_1fr_80px_auto]"
                  >
                    <select
                      className={champ}
                      value={ligne.medicamentId}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((l, i) =>
                            i === idx
                              ? { ...l, medicamentId: e.target.value }
                              : l
                          )
                        )
                      }
                    >
                      <option value="">
                        {t("medecins.ordonnances.medicament")}
                      </option>
                      {medicaments.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nom}
                          {m.dosage ? ` ${m.dosage}` : ""}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className={champ}
                      value={ligne.quantite}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((l, i) =>
                            i === idx
                              ? { ...l, quantite: Number(e.target.value) || 1 }
                              : l
                          )
                        )
                      }
                    />
                    <input
                      className={champ}
                      placeholder={t("medecins.ordonnances.posologie")}
                      value={ligne.posologie}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((l, i) =>
                            i === idx ? { ...l, posologie: e.target.value } : l
                          )
                        )
                      }
                    />
                    <input
                      className={champ}
                      placeholder={t("medecins.ordonnances.duree")}
                      value={ligne.dureeJours}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((l, i) =>
                            i === idx ? { ...l, dureeJours: e.target.value } : l
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() =>
                        setLignes((prev) =>
                          prev.length === 1
                            ? prev
                            : prev.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-bleu-medical"
                  onClick={() =>
                    setLignes((prev) => [
                      ...prev,
                      {
                        key: String(Date.now()),
                        medicamentId: "",
                        quantite: 1,
                        posologie: "",
                        dureeJours: "",
                      },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" />
                  {t("medecins.ordonnances.ajouterLigne")}
                </button>
                <textarea
                  className={`${champ} min-h-[60px]`}
                  placeholder={t("medecins.ordonnances.notes")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button
                  type="button"
                  disabled={enCours}
                  onClick={() => void creer()}
                  className="rounded-lg bg-bleu-medical px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {enCours ? (
                    <Loader2 className="inline h-4 w-4 animate-spin" />
                  ) : (
                    t("medecins.ordonnances.creer")
                  )}
                </button>
              </div>
            </div>

            {message && <p className="text-sm text-emerald-700">{message}</p>}
            {erreur && <p className="text-sm text-red-600">{erreur}</p>}

            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold">
                {t("medecins.ordonnances.liste")}
              </h3>
              {ordonnances.length === 0 ? (
                <p className="mt-2 text-sm text-texte-secondaire">
                  {t("medecins.ordonnances.vide")}
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {ordonnances.map((o) => (
                    <li
                      key={o.id}
                      className="rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">
                          {o.patient} — {o.numeroDossier}
                        </span>
                        <span className="text-xs text-texte-secondaire">
                          {o.statut} ·{" "}
                          {new Date(o.prescritLe).toLocaleString()}
                        </span>
                      </div>
                      <ul className="mt-2 text-xs text-texte-secondaire">
                        {o.lignes.map((l) => (
                          <li key={l.id}>
                            {l.medicament.nom} ×{l.quantite}
                            {l.posologie ? ` — ${l.posologie}` : ""}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </MiseEnPageMedecins>
  );
}
