"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { InboxDemandesRendezVous } from "@/features/rdv/inbox-demandes-rendez-vous";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION } from "@/constants/reception";

interface Props {
  utilisateur: UtilisateurMedecins;
}

export function ContenuRdvMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [motif, setMotif] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const libelles = useMemo(
    () => ({
      recherche: t("medecins.rdv.recherche"),
      tousStatuts: t("medecins.rdv.tousStatuts"),
      vide: t("medecins.rdv.vide"),
      charger: t("medecins.rdv.chargement"),
      erreur: t("medecins.rdv.erreur"),
      notes: t("medecins.rdv.notes"),
      enregistrer: t("medecins.rdv.enregistrer"),
      statut: t("medecins.rdv.statut"),
      nouvelle: t("medecins.rdv.nouvelle"),
      aujourdhui: t("medecins.rdv.aujourdhui"),
      premiereVisite: t("medecins.rdv.premiereVisite"),
      oui: t("medecins.rdv.oui"),
      non: t("medecins.rdv.non"),
      source: t("medecins.rdv.source"),
      reference: t("medecins.rdv.reference"),
      motif: t("medecins.rdv.motif"),
      type: t("medecins.rdv.type"),
      identite: t("medecins.rdv.identite"),
      contact: t("medecins.rdv.contact"),
      planning: t("medecins.rdv.planning"),
      libelleStatut: (s: string) => t(`medecins.rdv.statuts.${s}`, s),
    }),
    [t]
  );

  const creer = useCallback(async () => {
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
        rendezVous?: unknown;
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
      setReloadKey((k) => k + 1);
    } catch {
      setErreur(t("medecins.actions.erreurInattendue"));
    } finally {
      setEnCours(false);
    }
  }, [prenom, nom, telephone, email, motif, dateSouhaitee, t]);

  const formulaireCreation = (
    <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-texte-principal">
        {t("medecins.rdv.nouveau")}
      </h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input
          className={CLASSE_CHAMP_RECEPTION}
          placeholder={t("medecins.rdv.prenom")}
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />
        <input
          className={CLASSE_CHAMP_RECEPTION}
          placeholder={t("medecins.rdv.nom")}
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        <input
          className={CLASSE_CHAMP_RECEPTION}
          placeholder={t("medecins.rdv.telephone")}
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />
        <input
          className={CLASSE_CHAMP_RECEPTION}
          placeholder={t("medecins.rdv.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="datetime-local"
          className={CLASSE_CHAMP_RECEPTION}
          value={dateSouhaitee}
          onChange={(e) => setDateSouhaitee(e.target.value)}
        />
        <input
          className={CLASSE_CHAMP_RECEPTION}
          placeholder={t("medecins.rdv.motif")}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
        />
      </div>
      {message ? (
        <p className="mt-2 text-sm text-emerald-700">{message}</p>
      ) : null}
      {erreur ? <p className="mt-2 text-sm text-red-600">{erreur}</p> : null}
      <Bouton
        type="button"
        disabled={enCours}
        onClick={() => void creer()}
        className="mt-3"
      >
        {t("medecins.rdv.creer")}
      </Bouton>
    </div>
  );

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.rdv.titre")}
      sousTitre={t("medecins.rdv.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <EnTetePageReception
          icone={Calendar}
          titre={t("medecins.rdv.titre")}
          description={t("medecins.rdv.sousTitre")}
          fil={[
            { label: t("medecins.layout.titre"), href: "/sigh/medecins" },
            { label: t("medecins.rdv.titre") },
          ]}
        />
        <InboxDemandesRendezVous
          key={reloadKey}
          apiBase="/api/medecins/rendez-vous"
          modeSauvegarde="post-action"
          libelles={libelles}
          formulaireCreation={formulaireCreation}
        />
      </div>
    </MiseEnPageMedecins>
  );
}
