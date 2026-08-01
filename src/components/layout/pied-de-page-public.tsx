"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LogoHam } from "@/components/brand/logo-ham";
import { INFORMATIONS_HOPITAL, URL_CONNEXION_INTERNE } from "@/constants/navigation";
import { useLiensNavigation } from "@/hooks/use-liens-navigation";

export function PiedDePagePublic() {
  const { t } = useTranslation();
  const anneeActuelle = new Date().getFullYear();
  const { principale: liensNav } = useLiensNavigation();

  return (
    <footer className="pied-de-page-public border-t border-gris-bordure bg-[#0f172a] text-white">
      <div className="conteneur-principal py-12 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <LogoHam afficherTexte modeStatique taille="moyen" />
            <p className="text-sm leading-relaxed text-white/65">
              {t("hopital.slogan")}
            </p>
            <div className="flex gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icone, index) => (
                <a
                  key={index}
                  href="#"
                  className="rounded-lg bg-white/8 p-2 transition-colors hover:bg-white/15"
                  aria-label={t("common.reseauSocial")}
                >
                  <Icone className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("common.liensRapides")}</h3>
            <ul className="space-y-2">
              {liensNav.map((lien) => (
                <li key={lien.href}>
                  <Link
                    href={lien.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {lien.etiquette}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("common.nosServices")}</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/services/consultations" className="hover:text-white">
                  {t("footer.consultations")}
                </Link>
              </li>
              <li>
                <Link href="/services/laboratoire" className="hover:text-white">
                  {t("footer.laboratoire")}
                </Link>
              </li>
              <li>
                <Link href="/services/pharmacie" className="hover:text-white">
                  {t("footer.pharmacie")}
                </Link>
              </li>
              <li>
                <Link href="/services/urgences" className="hover:text-white">
                  {t("footer.urgences")}
                </Link>
              </li>
              <li>
                <Link href="/application" className="hover:text-white">
                  {t("footer.applicationMobile")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t("common.contact")}</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                {INFORMATIONS_HOPITAL.adresse}
              </li>
              <li className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2">
                <Phone className="h-4 w-4 shrink-0 text-white/40 sm:mt-0.5" />
                <span>
                  {INFORMATIONS_HOPITAL.telephone}
                  <span className="text-white/40"> · </span>
                  {t("common.responsable")} {INFORMATIONS_HOPITAL.telephoneSecondaire}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-white/40" />
                {INFORMATIONS_HOPITAL.email}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/50">
            © {anneeActuelle} {INFORMATIONS_HOPITAL.nomComplet}. {t("common.droitsReserves")}
          </p>
          <div className="flex gap-5 text-xs text-white/50">
            <Link href="/mentions-legales" className="hover:text-white">
              {t("common.mentionsLegales")}
            </Link>
            <Link href="/confidentialite" className="hover:text-white">
              {t("common.confidentialite")}
            </Link>
            <Link href={URL_CONNEXION_INTERNE} className="hover:text-white">
              {t("common.espacePersonnel")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
