"use client";

import { Clock, MapPin, Phone, Shield } from "lucide-react";
import { FormulaireReservation } from "@/features/rendez-vous/components/formulaire-reservation";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import {
  useContenuContact,
  useContenuRendezVous,
} from "@/hooks/use-contenu-page";

export function SectionReservationRendezVous() {
  const { reservation } = useContenuRendezVous();
  const { horaires } = useContenuContact();

  return (
    <section
      id="reservation"
      className="section-reservation bg-gris-tres-clair py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-reservation"
    >
      <div className="conteneur-principal">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bleu-medical">
            {reservation.surtitre}
          </p>
          <h2
            id="titre-reservation"
            className="mt-3 text-2xl font-extrabold text-[#2d2a6e] sm:text-3xl"
          >
            {reservation.titre}
          </h2>
          <p className="mt-3 text-sm text-texte-secondaire sm:text-base">
            {reservation.sousTitre}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-gris-bordure bg-white p-6 shadow-lg sm:p-8 lg:p-10">
              <FormulaireReservation />
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-gris-bordure bg-gradient-to-br from-[#2d2a6e] to-[#0f172a] p-6 text-white shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Shield className="h-5 w-5 text-[#7dd3fc]" />
              </div>
              <h3 className="mt-4 font-bold">{reservation.securise}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {reservation.securiseTexte}
              </p>
            </div>

            <div className="rounded-3xl border border-gris-bordure bg-white p-6 shadow-sm">
              <h3 className="font-bold text-[#2d2a6e]">{reservation.aide}</h3>
              <p className="mt-2 text-sm text-texte-secondaire">
                {reservation.aideTexte}
              </p>
              <a
                href={`tel:${INFORMATIONS_HOPITAL.telephone.replace(/\s/g, "")}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-bleu-medical hover:underline"
              >
                <Phone className="h-4 w-4" />
                {INFORMATIONS_HOPITAL.telephone}
              </a>
            </div>

            <div className="rounded-3xl border border-gris-bordure bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-[#2d2a6e]">
                <Clock className="h-5 w-5 text-bleu-medical" />
                {reservation.horaires}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-texte-secondaire">
                {horaires.jours.map((item) => (
                  <li
                    key={item.jour}
                    className="flex flex-col gap-0.5 sm:flex-row sm:justify-between"
                  >
                    <span>{item.jour}</span>
                    <span className="font-semibold text-texte-principal">
                      {item.heures}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-gris-bordure bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-[#2d2a6e]">
                <MapPin className="h-5 w-5 text-bleu-medical" />
                {reservation.adresse}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-texte-secondaire">
                {INFORMATIONS_HOPITAL.adresseCourte}
              </p>
              <a
                href="/contact#coordonnees-contact"
                className="mt-3 inline-block text-sm font-semibold text-bleu-medical hover:underline"
              >
                {reservation.voirCarte}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
