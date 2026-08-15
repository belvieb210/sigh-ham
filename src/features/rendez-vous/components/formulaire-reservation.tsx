"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Bouton } from "@/components/ui/bouton";
import { CarteTypePrestation } from "@/features/rendez-vous/components/carte-type-prestation";
import { BarreProgressionReservation } from "@/features/rendez-vous/components/barre-progression-reservation";
import { useContenuRendezVous } from "@/hooks/use-contenu-page";
import { useMedecinsVitrinePublic } from "@/hooks/use-medecins-vitrine-public";
import { useSchemaReservationRendezVous } from "@/hooks/use-schemas-validation";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import { estLangueSupportee } from "@/lib/i18n-config";
import { formaterDateAffichage, obtenirLocaleDate } from "@/lib/locale-date";
import type { IdTypePrestation } from "@/constants/rendez-vous";
import {
  type DonneesReservationRendezVous,
  genererDatesDisponibles,
  genererCreneauxDisponibles,
  soumettreReservationRendezVous,
} from "@/services/service-rendez-vous";
import { cn } from "@/lib/utils";

const CLASSE_CHAMP =
  "w-full rounded-xl border border-gris-bordure bg-white px-4 py-3 text-sm transition-colors focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20";

const DATES_DISPONIBLES = genererDatesDisponibles();

export function FormulaireReservation() {
  const { t, i18n } = useTranslation();
  const schemaReservationRendezVous = useSchemaReservationRendezVous();
  const { form, typesPrestation } = useContenuRendezVous();
  const { data: medecins = [], isLoading: medecinsChargement } =
    useMedecinsVitrinePublic();
  const localeDate = obtenirLocaleDate(
    estLangueSupportee(i18n.language) ? i18n.language : "fr"
  );

  const libellePrestation = (id: string) =>
    typesPrestation.find((p) => p.id === id)?.titre ?? id;
  const [etape, setEtape] = useState(1);
  const [enCours, setEnCours] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);

  const [donnees, setDonnees] = useState<Partial<DonneesReservationRendezVous>>({
    premiereVisite: false,
    consentement: undefined,
  });

  const creneaux =
    donnees.date ? genererCreneauxDisponibles(donnees.date) : [];

  const mettreAJour = <K extends keyof DonneesReservationRendezVous>(
    cle: K,
    valeur: DonneesReservationRendezVous[K]
  ) => {
    setDonnees((prev) => ({ ...prev, [cle]: valeur }));
    setErreurs((prev) => {
      const next = { ...prev };
      delete next[cle as string];
      return next;
    });
  };

  const validerEtape = (): boolean => {
    const champsParEtape: Record<number, (keyof DonneesReservationRendezVous)[]> =
      {
        1: ["typePrestation"],
        2: ["date", "creneau"],
        3: ["nomComplet", "email", "telephone", "consentement"],
      };

    const champs = champsParEtape[etape];
    if (!champs) return true;

    const sousSchema = schemaReservationRendezVous.pick(
      Object.fromEntries(champs.map((c) => [c, true])) as Record<
        keyof DonneesReservationRendezVous,
        true
      >
    );

    const resultat = sousSchema.safeParse(donnees);
    if (!resultat.success) {
      const nouvellesErreurs: Record<string, string> = {};
      resultat.error.errors.forEach((err) => {
        if (err.path[0]) {
          nouvellesErreurs[String(err.path[0])] = err.message;
        }
      });
      setErreurs(nouvellesErreurs);
      return false;
    }

    setErreurs({});
    return true;
  };

  const allerSuivant = () => {
    if (validerEtape()) setEtape((e) => Math.min(e + 1, 4));
  };

  const allerPrecedent = () => {
    setErreurs({});
    setEtape((e) => Math.max(e - 1, 1));
  };

  const confirmer = async () => {
    if (!validerEtape()) return;

    const resultat = schemaReservationRendezVous.safeParse(donnees);
    if (!resultat.success) {
      setMessageErreur(t("validation.verifierInfos"));
      return;
    }

    setEnCours(true);
    setMessageErreur(null);

    try {
      const reponse = await soumettreReservationRendezVous(resultat.data);
      if (reponse.succes && reponse.reference) {
        setReference(reponse.reference);
        setEtape(5);
      }
    } catch {
      setMessageErreur(t("messages.erreurGenerique"));
    } finally {
      setEnCours(false);
    }
  };

  const reinitialiser = () => {
    setEtape(1);
    setDonnees({ premiereVisite: false, consentement: undefined });
    setReference(null);
    setErreurs({});
    setMessageErreur(null);
  };

  return (
    <div className="formulaire-reservation">
      <BarreProgressionReservation etapeCourante={etape} />

      <AnimatePresence mode="wait">
        {etape === 1 && (
          <motion.div
            key="etape-1"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-bold text-[#2d2a6e]">
              {form.typeTitre}
            </h3>
            <p className="mt-1 text-sm text-texte-secondaire">
              {form.typeSousTitre}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {typesPrestation.map((prestation) => (
                <CarteTypePrestation
                  key={prestation.id}
                  id={prestation.id}
                  selectionne={donnees.typePrestation === prestation.id}
                  onSelectionner={(id) => mettreAJour("typePrestation", id)}
                />
              ))}
            </div>
            {erreurs.typePrestation && (
              <p className="mt-3 text-sm text-red-600">{erreurs.typePrestation}</p>
            )}
          </motion.div>
        )}

        {etape === 2 && (
          <motion.div
            key="etape-2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-bold text-[#2d2a6e]">
              {form.dateTitre}
            </h3>
            <p className="mt-1 text-sm text-texte-secondaire">
              {donnees.typePrestation &&
                libellePrestation(donnees.typePrestation)}
            </p>

            <div className="mt-6">
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-bleu-medical" />
                {form.dateLabel}
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {DATES_DISPONIBLES.slice(0, 15).map((dateIso) => {
                  const date = new Date(dateIso + "T12:00:00");
                  const selectionnee = donnees.date === dateIso;

                  return (
                    <button
                      key={dateIso}
                      type="button"
                      onClick={() => {
                        mettreAJour("date", dateIso);
                        mettreAJour("creneau", "");
                      }}
                      className={cn(
                        "rounded-xl border px-2 py-3 text-center transition-all",
                        selectionnee
                          ? "border-bleu-medical bg-bleu-medical-clair font-semibold text-bleu-medical"
                          : "border-gris-bordure bg-white hover:border-bleu-medical/40"
                      )}
                    >
                      <span className="block text-[10px] uppercase text-texte-secondaire sm:text-xs">
                        {date.toLocaleDateString(localeDate, { weekday: "short" })}
                      </span>
                      <span className="block text-lg font-bold">
                        {date.getDate()}
                      </span>
                      <span className="block text-[10px] text-texte-secondaire sm:text-xs">
                        {date.toLocaleDateString(localeDate, { month: "short" })}
                      </span>
                    </button>
                  );
                })}
              </div>
              {erreurs.date && (
                <p className="mt-2 text-sm text-red-600">{erreurs.date}</p>
              )}
            </div>

            {donnees.date && (
              <div className="mt-8">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-bleu-medical" />
                  {form.creneauLabel} —{" "}
                  <span className="font-normal text-texte-secondaire">
                    {formaterDateAffichage(donnees.date, localeDate)}
                  </span>
                </label>

                {creneaux.length === 0 ? (
                  <p className="rounded-xl bg-orange-50 p-4 text-sm text-orange-700">
                    {form.pasCreneau}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {creneaux.map((creneau) => (
                      <button
                        key={creneau}
                        type="button"
                        onClick={() => mettreAJour("creneau", creneau)}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all",
                          donnees.creneau === creneau
                            ? "border-bleu-medical bg-bleu-medical text-white"
                            : "border-gris-bordure bg-white hover:border-bleu-medical/40"
                        )}
                      >
                        {creneau}
                      </button>
                    ))}
                  </div>
                )}
                {erreurs.creneau && (
                  <p className="mt-2 text-sm text-red-600">{erreurs.creneau}</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {etape === 3 && (
          <motion.div
            key="etape-3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-bold text-[#2d2a6e]">
              {form.infosTitre}
            </h3>
            <p className="mt-1 text-sm text-texte-secondaire">
              {form.infosSousTitre}
            </p>

            {/* Récapitulatif compact */}
            <div className="mt-5 rounded-xl border border-bleu-medical/20 bg-bleu-medical-clair/40 p-4 text-sm">
              <p className="font-semibold text-bleu-medical">
                {donnees.typePrestation &&
                  libellePrestation(donnees.typePrestation)}
              </p>
              <p className="mt-1 text-texte-secondaire">
                {donnees.date && formaterDateAffichage(donnees.date)} à{" "}
                {donnees.creneau}
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="nomComplet" className="mb-1.5 block text-sm font-semibold">
                  {form.nom}
                </label>
                <input
                  id="nomComplet"
                  autoComplete="name"
                  value={donnees.nomComplet ?? ""}
                  onChange={(e) => mettreAJour("nomComplet", e.target.value)}
                  className={CLASSE_CHAMP}
                  placeholder={t("placeholders.nomRdv")}
                />
                {erreurs.nomComplet && (
                  <p className="mt-1 text-xs text-red-600">{erreurs.nomComplet}</p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                    {form.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={donnees.email ?? ""}
                    onChange={(e) => mettreAJour("email", e.target.value)}
                    className={CLASSE_CHAMP}
                    placeholder={t("placeholders.email")}
                  />
                  {erreurs.email && (
                    <p className="mt-1 text-xs text-red-600">{erreurs.email}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="telephone" className="mb-1.5 block text-sm font-semibold">
                    {form.telephone}
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    autoComplete="tel"
                    value={donnees.telephone ?? ""}
                    onChange={(e) => mettreAJour("telephone", e.target.value)}
                    className={CLASSE_CHAMP}
                    placeholder="+243 ..."
                  />
                  {erreurs.telephone && (
                    <p className="mt-1 text-xs text-red-600">{erreurs.telephone}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="dateNaissance" className="mb-1.5 block text-sm font-semibold">
                    {form.naissance}
                  </label>
                  <input
                    id="dateNaissance"
                    type="date"
                    value={donnees.dateNaissance ?? ""}
                    onChange={(e) => mettreAJour("dateNaissance", e.target.value)}
                    className={CLASSE_CHAMP}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={donnees.premiereVisite ?? false}
                      onChange={(e) =>
                        mettreAJour("premiereVisite", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gris-bordure text-bleu-medical focus:ring-bleu-medical"
                    />
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-bleu-medical" />
                      {form.premiereVisite}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="motif" className="mb-1.5 block text-sm font-semibold">
                  {form.motif}
                </label>
                <textarea
                  id="motif"
                  rows={3}
                  value={donnees.motif ?? ""}
                  onChange={(e) => mettreAJour("motif", e.target.value)}
                  className={cn(CLASSE_CHAMP, "resize-y")}
                  placeholder={t("placeholders.motifRdv")}
                />
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-gris-tres-clair p-4">
                <input
                  id="consentement-rdv"
                  type="checkbox"
                  checked={donnees.consentement === true}
                  onChange={(e) => {
                    if (e.target.checked) {
                      mettreAJour("consentement", true);
                    } else {
                      setDonnees((prev) => {
                        const { consentement: _, ...reste } = prev;
                        return reste;
                      });
                      setErreurs((prev) => {
                        const next = { ...prev };
                        delete next.consentement;
                        return next;
                      });
                    }
                  }}
                  className="mt-1 h-4 w-4 rounded border-gris-bordure text-bleu-medical focus:ring-bleu-medical"
                />
                <label htmlFor="consentement-rdv" className="text-xs leading-relaxed text-texte-secondaire">
                  {form.consentement}
                </label>
              </div>
              {erreurs.consentement && (
                <p className="text-xs text-red-600">{erreurs.consentement}</p>
              )}

              {messageErreur && (
                <div
                  role="alert"
                  className="flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  {messageErreur}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {etape === 4 && (
          <motion.div
            key="etape-4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-bold text-[#2d2a6e]">
              {form.medecinTitre}
            </h3>
            <p className="mt-1 text-sm text-texte-secondaire">
              {form.medecinSousTitre}
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  mettreAJour("medecinId", "");
                  mettreAJour("medecinNom", "");
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                  !donnees.medecinId
                    ? "border-bleu-medical bg-bleu-medical-clair/50 ring-2 ring-bleu-medical/20"
                    : "border-gris-bordure bg-white hover:border-bleu-medical/30"
                )}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gris-tres-clair text-bleu-medical">
                  <User className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-texte-principal">
                  {form.sansPreference}
                </span>
              </button>

              {medecinsChargement ? (
                <p className="text-sm text-texte-secondaire">
                  Chargement des médecins…
                </p>
              ) : (
                medecins.map((medecin) => {
                  const nomComplet = `Dr ${medecin.prenom} ${medecin.nom}`;
                  const selectionne = donnees.medecinId === medecin.id;
                  return (
                    <button
                      key={medecin.id}
                      type="button"
                      onClick={() => {
                        mettreAJour("medecinId", medecin.id);
                        mettreAJour("medecinNom", nomComplet);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                        selectionne
                          ? "border-bleu-medical bg-bleu-medical-clair/50 ring-2 ring-bleu-medical/20"
                          : "border-gris-bordure bg-white hover:border-bleu-medical/30"
                      )}
                    >
                      <AvatarUtilisateur
                        prenom={medecin.prenom}
                        nom={medecin.nom}
                        photoUrl={medecin.photoUrl}
                        taille="md"
                        forme="rond"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-texte-principal">
                          {nomComplet}
                        </span>
                        <span className="block truncate text-xs text-texte-secondaire">
                          {medecin.specialite}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {etape === 5 && reference && (
          <motion.div
            key="etape-5"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-vert-sante-clair">
              <CheckCircle2 className="h-9 w-9 text-vert-sante" />
            </div>
            <h3 className="mt-6 text-xl font-extrabold text-[#2d2a6e] sm:text-2xl">
              {form.succesTitre}
            </h3>
            <p className="mt-3 text-sm text-texte-secondaire sm:text-base">
              {form.succesTexte}
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gris-bordure bg-gris-tres-clair p-6 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-texte-secondaire">
                {form.reference}
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-bleu-medical">
                {reference}
              </p>
              <hr className="my-4 border-gris-bordure" />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-texte-secondaire">{form.prestation}</dt>
                  <dd className="font-semibold text-right">
                    {donnees.typePrestation &&
                      libellePrestation(donnees.typePrestation)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-texte-secondaire">{form.date}</dt>
                  <dd className="font-semibold text-right">
                    {donnees.date && formaterDateAffichage(donnees.date)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-texte-secondaire">{form.heure}</dt>
                  <dd className="font-semibold">{donnees.creneau}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-texte-secondaire">{form.medecin}</dt>
                  <dd className="font-semibold text-right">
                    {donnees.medecinNom?.trim() || form.sansPreference}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-texte-secondaire">{form.patient}</dt>
                  <dd className="font-semibold text-right">{donnees.nomComplet}</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={reinitialiser}
              className="mt-8 text-sm font-semibold text-bleu-medical hover:underline"
            >
              {form.autreRdv}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {etape < 5 && (
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gris-bordure pt-6 sm:flex-row sm:justify-between">
          {etape > 1 ? (
            <Bouton
              type="button"
              variante="contour"
              onClick={allerPrecedent}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              {form.retour}
            </Bouton>
          ) : (
            <div />
          )}

          {etape < 4 ? (
            <Bouton
              type="button"
              onClick={allerSuivant}
              className="w-full sm:w-auto"
            >
              {form.continuer}
              <ArrowRight className="h-4 w-4" />
            </Bouton>
          ) : (
            <Bouton
              type="button"
              onClick={confirmer}
              disabled={enCours}
              className="w-full sm:w-auto"
            >
              {enCours ? form.confirmationEnCours : form.confirmer}
              <CheckCircle2 className="h-4 w-4" />
            </Bouton>
          )}
        </div>
      )}
    </div>
  );
}
