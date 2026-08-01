"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Bouton } from "@/components/ui/bouton";
import { CaseACocher } from "@/components/ui/case-a-cocher";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { MiseEnPageAuth } from "@/features/connexion/mise-en-page-auth";
import {
  effacerIdentifiantMemorise,
  enregistrerIdentifiantMemorise,
  lireIdentifiantMemorise,
} from "@/lib/connexion-session";
import { cn } from "@/lib/utils";

const CLASSE_CHAMP =
  "w-full rounded-xl border border-gris-bordure bg-white py-3 pl-10 pr-4 text-sm transition-colors placeholder:text-texte-secondaire/60 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20";

export function ContenuConnexion() {
  const { t } = useTranslation();
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [seSouvenir, setSeSouvenir] = useState(false);
  const [charge, setCharge] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const memorise = lireIdentifiantMemorise();
    if (memorise) {
      setIdentifiant(memorise.identifiant);
      setSeSouvenir(memorise.seSouvenir);
    }
    setCharge(false);
  }, []);

  const onSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);

    if (seSouvenir && identifiant.trim()) {
      enregistrerIdentifiantMemorise(identifiant);
    } else {
      effacerIdentifiantMemorise();
    }

    setEnCours(true);

    try {
      const reponse = await fetch("/api/auth/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiant, motDePasse }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.message ?? "Connexion impossible.");
        return;
      }

      router.push(donnees.redirect ?? "/sigh/reception");
      router.refresh();
    } catch {
      setErreur("Impossible de joindre le serveur. Réessayez.");
    } finally {
      setEnCours(false);
    }
  };

  return (
    <MiseEnPageAuth
      badge={t("connexion.badge")}
      titre={t("connexion.titre")}
      description={`${t("connexion.description")} ${INFORMATIONS_HOPITAL.nomComplet}.`}
      securise={t("connexion.securise")}
      pied={t("connexion.noteDev")}
      lienRetour={{ href: "/", label: t("connexion.retourSite") }}
    >
      <form className="space-y-5" onSubmit={onSoumettre} noValidate>
        {erreur && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{erreur}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="identifiant"
            className="mb-1.5 block text-sm font-semibold text-texte-principal"
          >
            {t("connexion.identifiant")}
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire"
              aria-hidden
            />
            <input
              id="identifiant"
              name="identifiant"
              type="text"
              autoComplete="username"
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              disabled={enCours || charge}
              className={cn(CLASSE_CHAMP, (enCours || charge) && "opacity-60")}
              placeholder={t("connexion.placeholderIdentifiant")}
            />
          </div>
        </div>

        <ChampMotDePasse
          id="motDePasse"
          name="motDePasse"
          label={t("connexion.motDePasse")}
          placeholder="••••••••"
          required
          disabled={enCours}
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <CaseACocher
            id="seSouvenir"
            label={t("connexion.seSouvenir")}
            checked={seSouvenir}
            onChange={setSeSouvenir}
            disabled={enCours}
            description={
              seSouvenir ? t("connexion.seSouvenirAide") : undefined
            }
          />
          <Link
            href="/connexion/mot-de-passe-oublie"
            className="shrink-0 pt-0.5 text-sm font-medium text-bleu-medical hover:underline"
          >
            {t("connexion.motDePasseOublie")}
          </Link>
        </div>

        <Bouton
          type="submit"
          variante="primaire"
          taille="grand"
          className="w-full rounded-xl"
          disabled={enCours || charge}
        >
          {enCours ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("connexion.connexionEnCours")}
            </>
          ) : (
            t("connexion.seConnecter")
          )}
        </Bouton>
      </form>
    </MiseEnPageAuth>
  );
}
