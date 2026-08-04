"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type {
  AdmissionMedecins,
  LitDisponibleMedecins,
  PatientFileMedecins,
} from "@/lib/medecins/types";

interface Props {
  utilisateur: UtilisateurMedecins;
}

export function ContenuHospitalisationsMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier")?.trim() ?? "";

  const [patients, setPatients] = useState<PatientFileMedecins[]>([]);
  const [lits, setLits] = useState<LitDisponibleMedecins[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionMedecins[]>([]);
  const [dossierId, setDossierId] = useState(dossierUrl);
  const [litId, setLitId] = useState("");
  const [motif, setMotif] = useState("");
  const [notes, setNotes] = useState("");
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (dossierUrl) setDossierId(dossierUrl);
  }, [dossierUrl]);

  async function charger() {
    const [resP, resL, resA] = await Promise.all([
      fetch("/api/medecins/patients"),
      fetch("/api/medecins/lits"),
      fetch("/api/medecins/admissions?actives=1"),
    ]);
    const dataP = (await resP.json()) as { patients?: PatientFileMedecins[] };
    const dataL = (await resL.json()) as { lits?: LitDisponibleMedecins[] };
    const dataA = (await resA.json()) as { admissions?: AdmissionMedecins[] };
    setPatients(dataP.patients ?? []);
    setLits(dataL.lits ?? []);
    setAdmissions(dataA.admissions ?? []);
  }

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await charger();
      } catch {
        if (!annule) setErreur(t("medecins.hospitalisations.erreur"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [t]);

  async function admettre() {
    if (!dossierId || !litId || !motif.trim()) {
      setErreur(t("medecins.hospitalisations.champsRequis"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/medecins/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId, litId, motif, notes }),
      });
      const data = (await res.json()) as {
        admission?: AdmissionMedecins;
        erreur?: string;
      };
      if (!res.ok || !data.admission) {
        setErreur(data.erreur ?? t("medecins.actions.erreurInattendue"));
        return;
      }
      setMessage(t("medecins.hospitalisations.creee"));
      setMotif("");
      setNotes("");
      setLitId("");
      await charger();
    } catch {
      setErreur(t("medecins.actions.erreurInattendue"));
    } finally {
      setEnCours(false);
    }
  }

  async function sortir(id: string) {
    setEnCours(true);
    try {
      const res = await fetch("/api/medecins/admissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "sortir" }),
      });
      const data = (await res.json()) as { erreur?: string };
      if (!res.ok) {
        setErreur(data.erreur ?? t("medecins.actions.erreurInattendue"));
        return;
      }
      await charger();
    } finally {
      setEnCours(false);
    }
  }

  const champ =
    "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm outline-none focus:border-bleu-medical";
  const litsLibres = lits.filter((l) => !l.occupe);

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.hospitalisations.titre")}
      sousTitre={t("medecins.hospitalisations.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-5">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.hospitalisations.chargement")}
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold">
                {t("medecins.hospitalisations.nouvelle")}
              </h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <select
                  className={champ}
                  value={dossierId}
                  onChange={(e) => setDossierId(e.target.value)}
                >
                  <option value="">
                    {t("medecins.consultation.choisirPatient")}
                  </option>
                  {patients.map((p) => (
                    <option key={p.dossierId} value={p.dossierId}>
                      {p.nomComplet} — {p.numeroDossier}
                    </option>
                  ))}
                </select>
                <select
                  className={champ}
                  value={litId}
                  onChange={(e) => setLitId(e.target.value)}
                >
                  <option value="">{t("medecins.hospitalisations.choisirLit")}</option>
                  {litsLibres.map((l) => (
                    <option key={l.id} value={l.id}>
                      {t("medecins.hospitalisations.litLabel", {
                        chambre: l.chambre.numero,
                        lit: l.numero,
                        service: l.chambre.service,
                      })}
                    </option>
                  ))}
                </select>
                <input
                  className={champ}
                  placeholder={t("medecins.hospitalisations.motif")}
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />
                <input
                  className={champ}
                  placeholder={t("medecins.hospitalisations.notes")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={enCours}
                onClick={() => void admettre()}
                className="mt-3 rounded-lg bg-bleu-medical px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {t("medecins.hospitalisations.admettre")}
              </button>
            </div>

            {message && <p className="text-sm text-emerald-700">{message}</p>}
            {erreur && <p className="text-sm text-red-600">{erreur}</p>}

            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold">
                {t("medecins.hospitalisations.actives")}
              </h3>
              {admissions.length === 0 ? (
                <p className="mt-2 text-sm text-texte-secondaire">
                  {t("medecins.hospitalisations.vide")}
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-gris-bordure">
                  {admissions.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {a.patient} — {a.numeroDossier}
                        </p>
                        <p className="text-xs text-texte-secondaire">
                          {a.motif} ·{" "}
                          {a.chambre
                            ? `Ch. ${a.chambre.numero} / Lit ${a.lit?.numero ?? "—"}`
                            : "—"}{" "}
                          · {new Date(a.admisLe).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={enCours}
                        onClick={() => void sortir(a.id)}
                        className="rounded-lg border border-gris-bordure px-3 py-1.5 text-xs font-semibold"
                      >
                        {t("medecins.hospitalisations.sortir")}
                      </button>
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
