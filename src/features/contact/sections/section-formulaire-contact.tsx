"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { useTranslation } from "react-i18next";
import { useContenuContact } from "@/hooks/use-contenu-page";
import {
  useSchemaFormulaireContact,
  type DonneesFormulaireContact,
} from "@/hooks/use-schemas-validation";
import { envoyerMessageContact } from "@/services/service-contact";
import { cn } from "@/lib/utils";

const CLASSE_CHAMP =
  "w-full rounded-xl border border-gris-bordure bg-white px-4 py-3 text-sm transition-colors focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20";

export function SectionFormulaireContact() {
  const { t } = useTranslation();
  const schemaFormulaireContact = useSchemaFormulaireContact();
  const { formulaire, sujetsFormulaire, carteEmbed } = useContenuContact();
  const [messageRetour, setMessageRetour] = useState<{
    type: "succes" | "erreur";
    texte: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DonneesFormulaireContact>({
    resolver: zodResolver(schemaFormulaireContact),
    defaultValues: { sujet: "autre" },
  });

  const onSoumettre = async (donnees: DonneesFormulaireContact) => {
    setMessageRetour(null);
    try {
      const reponse = await envoyerMessageContact(donnees);
      if (reponse.succes) {
        setMessageRetour({ type: "succes", texte: t("messages.contactSucces") });
        reset({ sujet: "autre" });
      }
    } catch {
      setMessageRetour({
        type: "erreur",
        texte: t("messages.erreurGeneriqueContact"),
      });
    }
  };

  return (
    <section
      id="formulaire-contact"
      className="section-formulaire-contact bg-gris-tres-clair py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-formulaire"
    >
      <div className="conteneur-principal">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bleu-medical">
            {formulaire.surtitre}
          </p>
          <h2
            id="titre-formulaire"
            className="mt-3 text-2xl font-extrabold text-[#2d2a6e] sm:text-3xl"
          >
            {formulaire.titre}
          </h2>
          <p className="mt-3 text-sm text-texte-secondaire sm:text-base">
            {formulaire.sousTitre}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-5 lg:gap-10">
          {/* Formulaire */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit(onSoumettre)}
              className="rounded-3xl border border-gris-bordure bg-white p-6 shadow-lg sm:p-8"
              noValidate
            >
              {messageRetour && (
                <div
                  role="alert"
                  className={cn(
                    "mb-6 flex gap-3 rounded-xl p-4 text-sm",
                    messageRetour.type === "succes"
                      ? "bg-vert-sante-clair text-vert-sante"
                      : "bg-red-50 text-red-700"
                  )}
                >
                  {messageRetour.type === "succes" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  )}
                  {messageRetour.texte}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="nomComplet" className="mb-1.5 block text-sm font-semibold">
                    {formulaire.nom}
                  </label>
                  <input
                    id="nomComplet"
                    autoComplete="name"
                    {...register("nomComplet")}
                    className={CLASSE_CHAMP}
                    placeholder={t("placeholders.nomContact")}
                  />
                  {errors.nomComplet && (
                    <p className="mt-1 text-xs text-red-600">{errors.nomComplet.message}</p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                      {formulaire.email}
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                      className={CLASSE_CHAMP}
                      placeholder={t("placeholders.email")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="telephone" className="mb-1.5 block text-sm font-semibold">
                      {formulaire.telephone}
                    </label>
                    <input
                      id="telephone"
                      type="tel"
                      autoComplete="tel"
                      {...register("telephone")}
                      className={CLASSE_CHAMP}
                      placeholder="+243 ..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sujet" className="mb-1.5 block text-sm font-semibold">
                    {formulaire.sujet}
                  </label>
                  <select id="sujet" {...register("sujet")} className={CLASSE_CHAMP}>
                    {sujetsFormulaire.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.sujet && (
                    <p className="mt-1 text-xs text-red-600">{errors.sujet.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
                    {formulaire.message}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register("message")}
                    className={cn(CLASSE_CHAMP, "resize-y")}
                    placeholder={t("placeholders.messageContact")}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-gris-tres-clair p-4">
                  <input
                    id="consentement"
                    type="checkbox"
                    {...register("consentement")}
                    className="mt-1 h-4 w-4 rounded border-gris-bordure text-bleu-medical focus:ring-bleu-medical"
                  />
                  <label htmlFor="consentement" className="text-xs leading-relaxed text-texte-secondaire">
                    {formulaire.consentement}
                  </label>
                </div>
                {errors.consentement && (
                  <p className="text-xs text-red-600">{errors.consentement.message}</p>
                )}

                <Bouton
                  type="submit"
                  variante="primaire"
                  taille="grand"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? formulaire.envoi : formulaire.envoyer}
                </Bouton>
              </div>
            </form>
          </div>

          {/* Carte + infos latérales */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <div className="rounded-3xl border border-gris-bordure bg-gradient-to-br from-[#2d2a6e] to-[#0f172a] p-6 text-white shadow-lg">
              <h3 className="font-bold">{formulaire.aideImmediate}</h3>
              <p className="mt-2 text-sm text-white/70">
                {formulaire.aideTexte}
              </p>
              <a
                href={`tel:${INFORMATIONS_HOPITAL.telephone.replace(/\s/g, "")}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7dd3fc] hover:text-white"
              >
                <Phone className="h-4 w-4" />
                {INFORMATIONS_HOPITAL.telephone}
              </a>
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-white/70">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7dd3fc]" />
                  {INFORMATIONS_HOPITAL.adresseCourte}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-[#7dd3fc]" />
                  {formulaire.horairesLabel}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gris-bordure bg-white shadow-lg">
              <iframe
                title="Localisation HAM Laboratoire — MATETE, Kinshasa"
                src={carteEmbed}
                className="aspect-[4/3] w-full border-0 lg:aspect-square"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="text-center text-xs text-texte-secondaire">
              {formulaire.carteLegende}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
