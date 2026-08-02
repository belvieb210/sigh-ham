"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Camera,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Save,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { MiseEnPageReception, type UtilisateurReception } from "@/features/reception/mise-en-page-reception";
import { MiseEnPageCaisse } from "@/features/caisse/mise-en-page-caisse";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import type { ProfilUtilisateurPublic } from "@/lib/auth/types-profil";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

interface PropsContenuProfilUtilisateur {
  utilisateur: UtilisateurReception;
  /** Shell de salle (défaut: réception) */
  salle?: "reception" | "caisse";
}

function formaterDate(iso: string | null, locale: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function ContenuProfilUtilisateur({
  utilisateur,
  salle = "reception",
}: PropsContenuProfilUtilisateur) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const inputPhotoRef = useRef<HTMLInputElement>(null);
  const Layout = salle === "caisse" ? MiseEnPageCaisse : MiseEnPageReception;
  const titreLayout =
    salle === "caisse" ? t("caisse.layout.titre") : t("reception.layout.titre");
  const sousTitreLayout =
    salle === "caisse" ? t("caisse.layout.sousTitre") : t("reception.layout.sousTitre");
  const filAccueil =
    salle === "caisse"
      ? { label: t("caisse.layout.caisse"), href: "/sigh/caisse" }
      : { label: t("reception.common.reception"), href: "/sigh/reception" };

  const [profil, setProfil] = useState<ProfilUtilisateurPublic | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);

  const [prenom, setPrenom] = useState(utilisateur.prenom);
  const [nom, setNom] = useState(utilisateur.nom);
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(utilisateur.photoUrl ?? null);

  const [mdpActuel, setMdpActuel] = useState("");
  const [mdpNouveau, setMdpNouveau] = useState("");
  const [mdpConfirmation, setMdpConfirmation] = useState("");

  const [enCoursInfos, setEnCoursInfos] = useState(false);
  const [enCoursPhoto, setEnCoursPhoto] = useState(false);
  const [enCoursMdp, setEnCoursMdp] = useState(false);

  const [messageInfos, setMessageInfos] = useState<string | null>(null);
  const [erreurInfos, setErreurInfos] = useState<string | null>(null);
  const [messagePhoto, setMessagePhoto] = useState<string | null>(null);
  const [erreurPhoto, setErreurPhoto] = useState<string | null>(null);
  const [messageMdp, setMessageMdp] = useState<string | null>(null);
  const [erreurMdp, setErreurMdp] = useState<string | null>(null);

  const appliquerProfil = useCallback((data: ProfilUtilisateurPublic) => {
    setProfil(data);
    setPrenom(data.prenom);
    setNom(data.nom);
    setEmail(data.email ?? "");
    setTelephone(data.telephone ?? "");
    setPhotoUrl(data.photoUrl);
  }, []);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    setErreurChargement(null);

    fetch("/api/auth/profil")
      .then(async (res) => {
        const data = (await res.json()) as {
          profil?: ProfilUtilisateurPublic;
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("reception.profil.erreurs.chargement"));
        return data.profil!;
      })
      .then((data) => {
        if (!annule) {
          appliquerProfil(data);
          setChargement(false);
        }
      })
      .catch((error: unknown) => {
        if (!annule) {
          setErreurChargement(
            error instanceof Error ? error.message : t("reception.profil.erreurs.chargement")
          );
          setChargement(false);
        }
      });

    return () => {
      annule = true;
    };
  }, [appliquerProfil, t]);

  const utilisateurAffiche: UtilisateurReception = {
    prenom,
    nom,
    role: profil?.role.nom ?? utilisateur.role,
    photoUrl,
  };

  const sauvegarderInfos = async () => {
    setEnCoursInfos(true);
    setErreurInfos(null);
    setMessageInfos(null);

    try {
      const res = await fetch("/api/auth/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, nom, email, telephone }),
      });
      const data = (await res.json()) as {
        profil?: ProfilUtilisateurPublic;
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("reception.profil.erreurs.infos"));
      if (data.profil) appliquerProfil(data.profil);
      setMessageInfos(data.message ?? t("reception.profil.succes.infos"));
      router.refresh();
    } catch (error) {
      setErreurInfos(
        error instanceof Error ? error.message : t("reception.profil.erreurs.infos")
      );
    } finally {
      setEnCoursInfos(false);
    }
  };

  const uploaderPhoto = async (fichier: File) => {
    setEnCoursPhoto(true);
    setErreurPhoto(null);
    setMessagePhoto(null);

    try {
      const formData = new FormData();
      formData.append("photo", fichier);
      const res = await fetch("/api/auth/profil/photo", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        profil?: ProfilUtilisateurPublic;
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("reception.profil.erreurs.photo"));
      if (data.profil) appliquerProfil(data.profil);
      setMessagePhoto(data.message ?? t("reception.profil.succes.photo"));
      router.refresh();
    } catch (error) {
      setErreurPhoto(
        error instanceof Error ? error.message : t("reception.profil.erreurs.photo")
      );
    } finally {
      setEnCoursPhoto(false);
      if (inputPhotoRef.current) inputPhotoRef.current.value = "";
    }
  };

  const retirerPhoto = async () => {
    setEnCoursPhoto(true);
    setErreurPhoto(null);
    setMessagePhoto(null);

    try {
      const res = await fetch("/api/auth/profil/photo", { method: "DELETE" });
      const data = (await res.json()) as {
        profil?: ProfilUtilisateurPublic;
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? t("reception.profil.erreurs.photo"));
      if (data.profil) appliquerProfil(data.profil);
      setMessagePhoto(data.message ?? t("reception.profil.succes.photoRetiree"));
      router.refresh();
    } catch (error) {
      setErreurPhoto(
        error instanceof Error ? error.message : t("reception.profil.erreurs.photo")
      );
    } finally {
      setEnCoursPhoto(false);
    }
  };

  const changerMotDePasse = async () => {
    setEnCoursMdp(true);
    setErreurMdp(null);
    setMessageMdp(null);

    try {
      const res = await fetch("/api/auth/profil/mot-de-passe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actuel: mdpActuel,
          nouveau: mdpNouveau,
          confirmation: mdpConfirmation,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("reception.profil.erreurs.motDePasse"));
      setMessageMdp(data.message ?? t("reception.profil.succes.motDePasse"));
      setMdpActuel("");
      setMdpNouveau("");
      setMdpConfirmation("");
    } catch (error) {
      setErreurMdp(
        error instanceof Error ? error.message : t("reception.profil.erreurs.motDePasse")
      );
    } finally {
      setEnCoursMdp(false);
    }
  };

  return (
    <Layout
      utilisateur={utilisateurAffiche}
      titre={titreLayout}
      sousTitre={sousTitreLayout}
    >
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <EnTetePageReception
          titre={
            salle === "caisse"
              ? t("caisse.pages.profil.titre")
              : t("reception.pages.profil.titre")
          }
          description={
            salle === "caisse"
              ? t("caisse.pages.profil.description")
              : t("reception.pages.profil.description")
          }
          fil={[
            filAccueil,
            { label: t("reception.pages.profil.fil") },
          ]}
        />

        {chargement ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white px-6 py-16 text-sm text-texte-secondaire shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("reception.common.chargement")}
          </div>
        ) : erreurChargement ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700 shadow-sm">
            {erreurChargement}
          </div>
        ) : (
          <>
            {/* Photo */}
            <section className="rounded-xl border border-gris-bordure bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Camera className="h-4 w-4 text-bleu-medical" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                  {t("reception.profil.sections.photo")}
                </h2>
              </div>

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <AvatarUtilisateur
                  prenom={prenom}
                  nom={nom}
                  photoUrl={photoUrl}
                  taille="xl"
                  forme="rond"
                  className="ring-4 ring-bleu-medical/10"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm text-texte-secondaire">
                    {t("reception.profil.photoHint")}
                  </p>
                  <input
                    ref={inputPhotoRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const fichier = e.target.files?.[0];
                      if (fichier) void uploaderPhoto(fichier);
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Bouton
                      type="button"
                      variante="contour"
                      taille="petit"
                      disabled={enCoursPhoto}
                      onClick={() => inputPhotoRef.current?.click()}
                    >
                      {enCoursPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      {t("reception.profil.boutons.changerPhoto")}
                    </Bouton>
                    {photoUrl && (
                      <Bouton
                        type="button"
                        variante="fantome"
                        taille="petit"
                        disabled={enCoursPhoto}
                        onClick={() => void retirerPhoto()}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("reception.profil.boutons.retirerPhoto")}
                      </Bouton>
                    )}
                  </div>
                  {messagePhoto && (
                    <p className="flex items-center gap-1.5 text-sm text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {messagePhoto}
                    </p>
                  )}
                  {erreurPhoto && <p className="text-sm text-red-600">{erreurPhoto}</p>}
                </div>
              </div>
            </section>

            {/* Informations */}
            <section className="rounded-xl border border-gris-bordure bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-bleu-medical" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                  {t("reception.profil.sections.informations")}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profil-prenom" className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.profil.champs.prenom")}
                  </label>
                  <input
                    id="profil-prenom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className={CLASSE_CHAMP_RECEPTION}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="profil-nom" className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.profil.champs.nom")}
                  </label>
                  <input
                    id="profil-nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className={CLASSE_CHAMP_RECEPTION}
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <label htmlFor="profil-email" className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.profil.champs.email")}
                  </label>
                  <input
                    id="profil-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={CLASSE_CHAMP_RECEPTION}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="profil-telephone" className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.profil.champs.telephone")}
                  </label>
                  <input
                    id="profil-telephone"
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className={CLASSE_CHAMP_RECEPTION}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {messageInfos && (
                <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {messageInfos}
                </p>
              )}
              {erreurInfos && <p className="mt-4 text-sm text-red-600">{erreurInfos}</p>}

              <div className="mt-5 flex justify-end">
                <Bouton
                  type="button"
                  taille="petit"
                  disabled={enCoursInfos}
                  onClick={() => void sauvegarderInfos()}
                >
                  {enCoursInfos ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t("reception.profil.boutons.enregistrer")}
                </Bouton>
              </div>
            </section>

            {/* Compte (lecture seule) */}
            <section className="rounded-xl border border-gris-bordure bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-bleu-medical" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                  {t("reception.profil.sections.compte")}
                </h2>
              </div>
              <p className="mb-4 text-sm text-texte-secondaire">
                {t("reception.profil.compteHint")}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ChampLecture
                  label={t("reception.profil.champs.identifiant")}
                  valeur={profil?.identifiant ?? "—"}
                />
                <ChampLecture
                  label={t("reception.profil.champs.role")}
                  valeur={traduireRoleHospitalier(profil?.role.nom ?? utilisateur.role, t)}
                  badge
                />
                <ChampLecture
                  label={t("reception.profil.champs.salle")}
                  valeur={profil?.role.salle?.nom ?? "—"}
                />
                <ChampLecture
                  label={t("reception.profil.champs.derniereConnexion")}
                  valeur={formaterDate(profil?.derniereConnexion ?? null, i18n.language)}
                />
              </div>
            </section>

            {/* Mot de passe */}
            <section className="rounded-xl border border-gris-bordure bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-bleu-medical" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                  {t("reception.profil.sections.securite")}
                </h2>
              </div>
              <p className="mb-4 text-sm text-texte-secondaire">
                {t("reception.profil.securiteHint")}
              </p>

              <div className="space-y-4">
                <ChampMotDePasse
                  id="profil-mdp-actuel"
                  label={t("reception.profil.champs.mdpActuel")}
                  value={mdpActuel}
                  onChange={(e) => setMdpActuel(e.target.value)}
                  autoComplete="current-password"
                />
                <ChampMotDePasse
                  id="profil-mdp-nouveau"
                  label={t("reception.profil.champs.mdpNouveau")}
                  value={mdpNouveau}
                  onChange={(e) => setMdpNouveau(e.target.value)}
                  autoComplete="new-password"
                />
                <ChampMotDePasse
                  id="profil-mdp-confirmation"
                  label={t("reception.profil.champs.mdpConfirmation")}
                  value={mdpConfirmation}
                  onChange={(e) => setMdpConfirmation(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              {messageMdp && (
                <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {messageMdp}
                </p>
              )}
              {erreurMdp && <p className="mt-4 text-sm text-red-600">{erreurMdp}</p>}

              <div className="mt-5 flex justify-end">
                <Bouton
                  type="button"
                  variante="secondaire"
                  taille="petit"
                  disabled={enCoursMdp}
                  onClick={() => void changerMotDePasse()}
                >
                  {enCoursMdp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {t("reception.profil.boutons.changerMotDePasse")}
                </Bouton>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

function ChampLecture({
  label,
  valeur,
  badge = false,
}: {
  label: string;
  valeur: string;
  badge?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gris-bordure bg-gris-tres-clair/50 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
        {label}
      </p>
      {badge ? (
        <span
          className={cn(
            "mt-1 inline-flex rounded-full bg-bleu-medical-clair px-2.5 py-0.5 text-xs font-semibold text-bleu-medical"
          )}
        >
          {valeur}
        </span>
      ) : (
        <p className="mt-0.5 text-sm font-medium text-texte-principal">{valeur}</p>
      )}
    </div>
  );
}
