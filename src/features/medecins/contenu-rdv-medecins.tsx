"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type { RendezVousMedecins } from "@/lib/medecins/types";

interface Props {
  utilisateur: UtilisateurMedecins;
}

const STATUTS = ["DEMANDE", "CONFIRME", "ANNULE", "TERMINE", "ABSENT"] as const;

export function ContenuRdvMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<RendezVousMedecins[]>([]);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [motif, setMotif] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function charger() {
    const res = await fetch("/api/medecins/rendez-vous");
    const data = (await res.json()) as { rendezVous?: RendezVousMedecins[] };
    setListe(data.rendezVous ?? []);
  }

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await charger();
      } catch {
        if (!annule) setErreur(t("medecins.rdv.erreur"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [t]);

  async function creer() {
    if (!prenom.trim() || !nom.trim() || !telephone.trim() || !dateSouhaitee) {
      setErreur(t("medecins.rdv.champsRequis"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/medecins/rendez-vous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom,
          nom,
          telephone,
          email: email || null,
          motif: motif || null,
          dateSouhaitee: new Date(dateSouhaitee).toISOString(),
        }),
      });
      const data = (await res.json()) as {
        rendezVous?: RendezVousMedecins;
        erreur?: string;
      };
      if (!res.ok || !data.rendezVous) {
        setErreur(data.erreur ?? t("medecins.actions.erreurInattendue"));
        return;
      }
      setMessage(t("medecins.rdv.cree"));
      setPrenom("");
      setNom("");
      setTelephone("");
      setEmail("");
      setMotif("");
      setDateSouhaitee("");
      await charger();
    } catch {
      setErreur(t("medecins.actions.erreurInattendue"));
    } finally {
      setEnCours(false);
    }
  }

  async function changerStatut(id: string, statut: string) {
    setEnCours(true);
    try {
      await fetch("/api/medecins/rendez-vous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statut, action: "statut" }),
      });
      await charger();
    } finally {
      setEnCours(false);
    }
  }

  const champ =
    "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm outline-none focus:border-bleu-medical";

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.rdv.titre")}
      sousTitre={t("medecins.rdv.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-5">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.rdv.chargement")}
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold">{t("medecins.rdv.nouveau")}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  className={champ}
                  placeholder={t("medecins.rdv.prenom")}
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
                <input
                  className={champ}
                  placeholder={t("medecins.rdv.nom")}
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
                <input
                  className={champ}
                  placeholder={t("medecins.rdv.telephone")}
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
                <input
                  className={champ}
                  placeholder={t("medecins.rdv.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="datetime-local"
                  className={champ}
                  value={dateSouhaitee}
                  onChange={(e) => setDateSouhaitee(e.target.value)}
                />
                <input
                  className={champ}
                  placeholder={t("medecins.rdv.motif")}
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={enCours}
                onClick={() => void creer()}
                className="mt-3 rounded-lg bg-bleu-medical px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {t("medecins.rdv.creer")}
              </button>
            </div>

            {message && <p className="text-sm text-emerald-700">{message}</p>}
            {erreur && <p className="text-sm text-red-600">{erreur}</p>}

            <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold">{t("medecins.rdv.liste")}</h3>
              {liste.length === 0 ? (
                <p className="mt-2 text-sm text-texte-secondaire">
                  {t("medecins.rdv.vide")}
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-gris-bordure">
                  {liste.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {r.prenom} {r.nom}
                        </p>
                        <p className="text-xs text-texte-secondaire">
                          {r.telephone} ·{" "}
                          {new Date(r.dateSouhaitee).toLocaleString()}
                          {r.motif ? ` · ${r.motif}` : ""}
                        </p>
                      </div>
                      <select
                        className="rounded-lg border border-gris-bordure px-2 py-1 text-xs"
                        value={r.statut}
                        disabled={enCours}
                        onChange={(e) =>
                          void changerStatut(r.id, e.target.value)
                        }
                      >
                        {STATUTS.map((s) => (
                          <option key={s} value={s}>
                            {t(`medecins.rdv.statuts.${s}`)}
                          </option>
                        ))}
                      </select>
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
