"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Bouton } from "@/components/ui/bouton";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { MiseEnPageAuth } from "@/features/connexion/mise-en-page-auth";
import { cn } from "@/lib/utils";

const CLASSE_CHAMP =
  "w-full rounded-xl border border-gris-bordure bg-white py-3 pl-10 pr-4 text-sm transition-colors placeholder:text-texte-secondaire/60 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20";

type Etape = "demande" | "nouveau";

export function ContenuReinitialisationMotDePasse() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const tokenUrl = searchParams.get("token")?.trim() || "";

  const [etape, setEtape] = useState<Etape>(tokenUrl ? "nouveau" : "demande");
  const [token, setToken] = useState(tokenUrl);
  const [enCours, setEnCours] = useState(false);
  const [email, setEmail] = useState("");
  const [compteLabel, setCompteLabel] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurMotDePasse, setErreurMotDePasse] = useState<string | null>(null);
  const [motDePasseEnregistre, setMotDePasseEnregistre] = useState(false);

  useEffect(() => {
    if (tokenUrl) {
      setToken(tokenUrl);
      setEtape("nouveau");
    }
  }, [tokenUrl]);

  const demanderLien = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      const res = await fetch("/api/auth/mot-de-passe-oublie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as {
        message?: string;
        token?: string;
        compte?: string;
      };
      if (!res.ok || !data.token) {
        setErreur(
          data.message ||
            t("reinitialisationMotDePasse.compteIntrouvable")
        );
        return;
      }
      setToken(data.token);
      setCompteLabel(data.compte ?? email.trim());
      setEtape("nouveau");
    } catch {
      setErreur(t("reinitialisationMotDePasse.erreurReseau"));
    } finally {
      setEnCours(false);
    }
  };

  const definirNouveauMotDePasse = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nouveau = (
      form.elements.namedItem("nouveauMotDePasse") as HTMLInputElement
    ).value;
    const confirmer = (
      form.elements.namedItem("confirmerMotDePasse") as HTMLInputElement
    ).value;

    if (nouveau !== confirmer) {
      setErreurMotDePasse(t("reinitialisationMotDePasse.motDePasseDifferent"));
      return;
    }
    if (!token) {
      setErreurMotDePasse(t("reinitialisationMotDePasse.lienInvalide"));
      return;
    }

    setErreurMotDePasse(null);
    setErreur(null);
    setEnCours(true);
    try {
      const res = await fetch("/api/auth/reinitialiser-mot-de-passe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nouveauMotDePasse: nouveau,
          confirmerMotDePasse: confirmer,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setErreurMotDePasse(
          data.message || t("reinitialisationMotDePasse.erreurEnregistrement")
        );
        return;
      }
      setMotDePasseEnregistre(true);
    } catch {
      setErreurMotDePasse(t("reinitialisationMotDePasse.erreurReseau"));
    } finally {
      setEnCours(false);
    }
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
            <Bouton
              variante="primaire"
              taille="grand"
              className="w-full rounded-xl"
              enTantQueEnfant
            >
              {t("connexion.seConnecter")}
            </Bouton>
          </Link>
        </div>
      </MiseEnPageAuth>
    );
  }

  if (etape === "nouveau") {
    return (
      <MiseEnPageAuth
        badge={t("reinitialisationMotDePasse.badge")}
        titre={t("reinitialisationMotDePasse.nouveauTitre")}
        description={
          compteLabel
            ? t("reinitialisationMotDePasse.nouveauDescriptionCompte", {
                compte: compteLabel,
              })
            : t("reinitialisationMotDePasse.nouveauDescription")
        }
        securise={t("connexion.securise")}
        lienRetour={{
          href: "/connexion",
          label: t("reinitialisationMotDePasse.retourConnexion"),
        }}
      >
        <form
          className="space-y-5"
          onSubmit={definirNouveauMotDePasse}
          noValidate
        >
          {erreur ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erreur}
            </p>
          ) : null}
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
            disabled={enCours || !token}
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
        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}
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
              type="text"
              autoComplete="username"
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
