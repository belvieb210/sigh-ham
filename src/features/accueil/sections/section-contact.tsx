"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";

const schemaFormulaireContact = z.object({
  nomComplet: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().optional(),
  sujet: z.string().min(3, "Le sujet est requis"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

type DonneesFormulaireContact = z.infer<typeof schemaFormulaireContact>;

export function SectionContact() {
  const [messageSucces, setMessageSucces] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DonneesFormulaireContact>({
    resolver: zodResolver(schemaFormulaireContact),
  });

  const onSoumettre = async (donnees: DonneesFormulaireContact) => {
    // TODO: intégrer l'API de contact avec les données reçues
    void donnees;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    reset();
    setMessageSucces(true);
    window.setTimeout(() => setMessageSucces(false), 5000);
  };

  return (
    <section
      id="contact"
      className="section-contact bg-gris-tres-clair py-16 lg:py-24"
      aria-labelledby="titre-contact"
    >
      <div className="conteneur-principal">
        <div className="mb-10 text-center">
          <h2 id="titre-contact" className="titre-section">
            Contactez-nous
          </h2>
          <p className="mt-2 text-texte-secondaire">
            Notre équipe est à votre disposition pour répondre à vos questions
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Informations contact */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border border-gris-bordure bg-white p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bleu-medical-clair text-bleu-medical">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Adresse</h3>
                <p className="text-sm text-texte-secondaire">
                  {INFORMATIONS_HOPITAL.adresse}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-gris-bordure bg-white p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bleu-medical-clair text-bleu-medical">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Téléphone</h3>
                <p className="text-sm text-texte-secondaire">
                  {INFORMATIONS_HOPITAL.telephone}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-gris-bordure bg-white p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bleu-medical-clair text-bleu-medical">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-texte-secondaire">
                  {INFORMATIONS_HOPITAL.email}
                </p>
              </div>
            </div>

            {/* Placeholder carte */}
            <div className="aspect-video overflow-hidden rounded-xl border border-gris-bordure bg-white">
              <iframe
                title="Localisation SIGH Hôpital Central"
                src="https://maps.google.com/maps?q=Kinshasa&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Formulaire */}
          <form
            onSubmit={handleSubmit(onSoumettre)}
            className="rounded-xl border border-gris-bordure bg-white p-6 shadow-sm lg:p-8"
            noValidate
          >
            {messageSucces ? (
              <p
                role="status"
                className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                Message envoyé avec succès !
              </p>
            ) : null}
            <div className="space-y-4">
              <div>
                <label htmlFor="nomComplet" className="mb-1 block text-sm font-medium">
                  Nom complet *
                </label>
                <input
                  id="nomComplet"
                  {...register("nomComplet")}
                  className="w-full rounded-lg border border-gris-bordure px-4 py-2.5 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20"
                />
                {errors.nomComplet && (
                  <p className="mt-1 text-xs text-red-600">{errors.nomComplet.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="w-full rounded-lg border border-gris-bordure px-4 py-2.5 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="telephone" className="mb-1 block text-sm font-medium">
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    {...register("telephone")}
                    className="w-full rounded-lg border border-gris-bordure px-4 py-2.5 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="sujet" className="mb-1 block text-sm font-medium">
                  Sujet *
                </label>
                <input
                  id="sujet"
                  {...register("sujet")}
                  className="w-full rounded-lg border border-gris-bordure px-4 py-2.5 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20"
                />
                {errors.sujet && (
                  <p className="mt-1 text-xs text-red-600">{errors.sujet.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={4}
                  {...register("message")}
                  className="w-full rounded-lg border border-gris-bordure px-4 py-2.5 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                )}
              </div>
              <Bouton
                type="submit"
                variante="primaire"
                taille="grand"
                className="w-full"
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
              </Bouton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
