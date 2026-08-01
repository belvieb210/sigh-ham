"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Bouton } from "@/components/ui/bouton";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { MiseEnPageAuth } from "@/features/connexion/mise-en-page-auth";
import { cn } from "@/lib/utils";

const CLASSE_CHAMP =
  "w-full rounded-xl border border-gris-bordure bg-white py-3 pl-10 pr-4 text-sm transition-colors placeholder:text-texte-secondaire/60 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20";

type Etape = "demande" | "succes" | "nouveau";

export function ContenuReinitialisationMotDePasse() {
  const { t } = useTranslation();
  const [etape, setEtape] = useState<Etape>("demande");
  const [enCours, setEnCours] = useState(false);
  const [email, setEmail] = useState("");
  const [erreurMotDePasse, setErreurMotDePasse] = useState<string | null>(null);
  const [motDePasseEnregistre, setMotDePasseEnregistre] = useState(false);

  const demanderLien = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEnCours(false);
    setEtape("succes");
  };

  const definirNouveauMotDePasse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nouveau = (form.elements.namedItem("nouveauMotDePasse") as HTMLInputElement)
      .value;
    const confirmer = (form.elements.namedItem("confirmerMotDePasse") as HTMLInputElement)
      .value;

    if (nouveau !== confirmer) {
      setErreurMotDePasse(t("reinitialisationMotDePasse.motDePasseDifferent"));
      return;
    }

    setErreurMotDePasse(null);
    setEnCours(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEnCours(false);
    setMotDePasseEnregistre(true);
  };

  if (motDePasseEnregistre) {
    return (
      <MiseEnPageAuth
        badge={t("reinitialisationMotDePasse.badge")}
        titre={t("reinitialisationMotDePasse.enregistreTitre")}
        description={t("reinitialisationMotDePasse.enregistreTexte")}
        securise={t("connexion.securise")}
        lienRetour={{
          href: "/connexion",
          label: t("reinitialisationMotDePasse.retourConnexion"),
        }}
      >
        <div className="flex flex-col items-center py-4">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-vert-sante-clair">
            <CheckCircle2 className="h-8 w-8 text-vert-sante" />
          </div>
          <Link href="/connexion" className="w-full">
            <Bouton variante="primaire" taille="grand" className="w-full rounded-xl" enTantQueEnfant>
              {t("connexion.seConnecter")}
            </Bouton>
          </Link>
        </div>
      </MiseEnPageAuth>
    );
  }

  if (etape === "succes") {
    return (
      <MiseEnPageAuth
        badge={t("reinitialisationMotDePasse.badge")}
        titre={t("reinitialisationMotDePasse.succesTitre")}
        description={t("reinitialisationMotDePasse.succesTexte")}
        securise={t("connexion.securise")}
        lienRetour={{
          href: "/connexion",
          label: t("reinitialisationMotDePasse.retourConnexion"),
        }}
      >
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-vert-sante-clair">
            <CheckCircle2 className="h-8 w-8 text-vert-sante" />
          </div>
          {email && (
            <p className="mb-4 text-sm text-texte-secondaire">
              {t("reinitialisationMotDePasse.emailEnvoye", { email })}
            </p>
          )}
          <Bouton
            variante="secondaire"
            taille="grand"
            className="w-full rounded-xl"
            onClick={() => setEtape("nouveau")}
          >
            {t("reinitialisationMotDePasse.simulerLien")}
          </Bouton>
        </div>
      </MiseEnPageAuth>
    );
  }

  if (etape === "nouveau") {
    return (
      <MiseEnPageAuth
        badge={t("reinitialisationMotDePasse.badge")}
        titre={t("reinitialisationMotDePasse.nouveauTitre")}
        description={t("reinitialisationMotDePasse.nouveauDescription")}
        securise={t("connexion.securise")}
        lienRetour={{
          href: "/connexion",
          label: t("reinitialisationMotDePasse.retourConnexion"),
        }}
      >
        <form className="space-y-5" onSubmit={definirNouveauMotDePasse} noValidate>
          <ChampMotDePasse
            id="nouveauMotDePasse"
            name="nouveauMotDePasse"
            label={t("reinitialisationMotDePasse.nouveauMotDePasse")}
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={8}
            disabled={enCours}
          />

          <ChampMotDePasse
            id="confirmerMotDePasse"
            name="confirmerMotDePasse"
            label={t("reinitialisationMotDePasse.confirmerMotDePasse")}
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={8}
            disabled={enCours}
            erreur={erreurMotDePasse ?? undefined}
          />

          <p className="text-xs text-texte-secondaire">
            {t("reinitialisationMotDePasse.reglesMotDePasse")}
          </p>

          <Bouton
            type="submit"
            variante="primaire"
            taille="grand"
            className="w-full rounded-xl"
            disabled={enCours}
          >
            {enCours ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("reinitialisationMotDePasse.enregistrement")}
              </>
            ) : (
              t("reinitialisationMotDePasse.enregistrer")
            )}
          </Bouton>
        </form>
      </MiseEnPageAuth>
    );
  }

  return (
    <MiseEnPageAuth
      badge={t("reinitialisationMotDePasse.badge")}
      titre={t("reinitialisationMotDePasse.titre")}
      description={t("reinitialisationMotDePasse.description")}
      securise={t("connexion.securise")}
      pied={t("reinitialisationMotDePasse.noteSecurite")}
      lienRetour={{
        href: "/connexion",
        label: t("reinitialisationMotDePasse.retourConnexion"),
      }}
    >
      <form className="space-y-5" onSubmit={demanderLien} noValidate>
        <div>
          <label
            htmlFor="emailReinitialisation"
            className="mb-1.5 block text-sm font-semibold text-texte-principal"
          >
            {t("reinitialisationMotDePasse.email")}
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire"
              aria-hidden
            />
            <input
              id="emailReinitialisation"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={enCours}
              className={cn(CLASSE_CHAMP, enCours && "opacity-60")}
              placeholder={t("reinitialisationMotDePasse.placeholderEmail")}
            />
          </div>
        </div>

        <Bouton
          type="submit"
          variante="primaire"
          taille="grand"
          className="w-full rounded-xl"
          disabled={enCours}
        >
          {enCours ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("reinitialisationMotDePasse.envoiEnCours")}
            </>
          ) : (
            t("reinitialisationMotDePasse.envoyer")
          )}
        </Bouton>
      </form>
    </MiseEnPageAuth>
  );
}
