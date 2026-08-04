"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { EVENEMENT_MEDECINS_EXTERNES_MODIFIE } from "@/constants/medecins-externes";

export function ContenuNouveauMedecinsExternes({
  utilisateur,
}: {
  utilisateur: UtilisateurMedecinsExternes;
}) {
  const { t } = useTranslation();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [sexe, setSexe] = useState<"MASCULIN" | "FEMININ" | "">("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [orienterCaisse, setOrienterCaisse] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const soumettre = async () => {
    setBusy(true);
    setMessage(null);
    setErreur(null);
    try {
      const res = await fetch("/api/medecins-externes/patients/enregistrer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeVisite: "nouveau",
          prenom,
          nom,
          sexe,
          dateNaissance,
          telephone,
          adresse,
          orientations: orienterCaisse ? ["CAISSE"] : [],
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        numeroPatient?: string;
        dossierId?: string;
      };
      if (!res.ok) {
        setErreur(data.message ?? t("medecinsExternes.common.erreur"));
        return;
      }
      setMessage(
        `${data.message ?? t("medecinsExternes.nouveau.succes")} — ${data.numeroPatient ?? ""}`
      );
      setPrenom("");
      setNom("");
      setSexe("");
      setDateNaissance("");
      setTelephone("");
      setAdresse("");
      window.dispatchEvent(new Event(EVENEMENT_MEDECINS_EXTERNES_MODIFIE));
    } catch {
      setErreur(t("medecinsExternes.common.erreur"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MiseEnPageMedecinsExternes
      utilisateur={utilisateur}
      titre={t("medecinsExternes.nouveau.titre")}
      sousTitre={t("medecinsExternes.nouveau.sousTitre")}
    >
      <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={CLASSE_LABEL_RECEPTION}>{t("medecinsExternes.nouveau.prenom")}</label>
            <input className={CLASSE_CHAMP_RECEPTION} value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          </div>
          <div>
            <label className={CLASSE_LABEL_RECEPTION}>{t("medecinsExternes.nouveau.nom")}</label>
            <input className={CLASSE_CHAMP_RECEPTION} value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div>
            <label className={CLASSE_LABEL_RECEPTION}>{t("medecinsExternes.nouveau.sexe")}</label>
            <select className={CLASSE_CHAMP_RECEPTION} value={sexe} onChange={(e) => setSexe(e.target.value as typeof sexe)}>
              <option value="">—</option>
              <option value="MASCULIN">M</option>
              <option value="FEMININ">F</option>
            </select>
          </div>
          <div>
            <label className={CLASSE_LABEL_RECEPTION}>{t("medecinsExternes.nouveau.dateNaissance")}</label>
            <input type="date" className={CLASSE_CHAMP_RECEPTION} value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
          </div>
          <div>
            <label className={CLASSE_LABEL_RECEPTION}>{t("medecinsExternes.nouveau.telephone")}</label>
            <input className={CLASSE_CHAMP_RECEPTION} value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={CLASSE_LABEL_RECEPTION}>{t("medecinsExternes.nouveau.adresse")}</label>
            <input className={CLASSE_CHAMP_RECEPTION} value={adresse} onChange={(e) => setAdresse(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={orienterCaisse}
            onChange={(e) => setOrienterCaisse(e.target.checked)}
          />
          {t("medecinsExternes.nouveau.orienterCaisse")}
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void soumettre()}
          className="rounded-lg bg-bleu-medical px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="inline h-4 w-4 animate-spin" /> : t("medecinsExternes.nouveau.enregistrer")}
        </button>
      </div>
    </MiseEnPageMedecinsExternes>
  );
}
