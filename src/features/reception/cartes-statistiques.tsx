"use client";

import { UserPlus, Clock, ArrowRightLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STATISTIQUES_RECEPTION } from "@/constants/reception";

export function CartesStatistiquesReception() {
  const { t } = useTranslation();

  const stats = [
    {
      libelle: t("reception.stats.patientsAujourdhui"),
      libelleCourt: t("reception.stats.aujourdhui"),
      valeur: STATISTIQUES_RECEPTION.patientsAujourdhui.valeur,
      detail: t("reception.stats.evolution", {
        evolution: STATISTIQUES_RECEPTION.patientsAujourdhui.evolution,
      }),
      detailPositif: true,
      icone: UserPlus,
      couleurIcone: "bg-blue-100 text-blue-600",
    },
    {
      libelle: t("reception.stats.enAttente"),
      libelleCourt: t("reception.stats.enAttente"),
      valeur: STATISTIQUES_RECEPTION.enAttente.valeur,
      detail: t("reception.stats.salleInfirmiers"),
      icone: Clock,
      couleurIcone: "bg-amber-100 text-amber-600",
    },
    {
      libelle: t("reception.stats.transferes"),
      libelleCourt: t("reception.stats.transferes"),
      valeur: STATISTIQUES_RECEPTION.transferes.valeur,
      detail: t("reception.stats.versServices"),
      icone: ArrowRightLeft,
      couleurIcone: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <>
      {/* Mobile : défilement horizontal */}
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory lg:hidden">
        {stats.map((stat) => {
          const Icone = stat.icone;
          return (
            <div
              key={stat.libelle}
              className="min-w-[148px] flex-shrink-0 snap-start rounded-xl border border-gris-bordure bg-white p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className={`rounded-lg p-1.5 ${stat.couleurIcone}`}>
                  <Icone className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-texte-principal">{stat.valeur}</p>
              <p className="text-xs font-medium text-texte-principal">{stat.libelleCourt}</p>
              <p
                className={`mt-0.5 text-[10px] leading-tight ${
                  stat.detailPositif ? "font-medium text-vert-sante" : "text-texte-secondaire"
                }`}
              >
                {stat.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Desktop : grille */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-3">
        {stats.map((stat) => {
          const Icone = stat.icone;
          return (
            <div
              key={stat.libelle}
              className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-texte-secondaire">{stat.libelle}</p>
                  <p className="mt-1 text-3xl font-bold text-texte-principal">{stat.valeur}</p>
                  <p
                    className={`mt-1 text-xs ${
                      stat.detailPositif ? "font-medium text-vert-sante" : "text-texte-secondaire"
                    }`}
                  >
                    {stat.detail}
                  </p>
                </div>
                <div className={`rounded-lg p-2.5 ${stat.couleurIcone}`}>
                  <Icone className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
