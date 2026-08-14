"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LogOut, Menu, X } from "lucide-react";
import { LogoHam } from "@/components/brand/logo-ham";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import { SelecteurLangue } from "@/components/ui/selecteur-langue";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { MenuProfilEntete } from "@/features/reception/menu-profil-entete";
import { RecherchePatientEnTete } from "@/features/reception/recherche-patient-en-tete";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import { BadgeMessagerieSidebar } from "@/features/messagerie/badge-messagerie-sidebar";
import { BadgeNotificationsSidebar } from "@/features/notifications/badge-notifications-sidebar";
import { BoutonNotificationsEnTete } from "@/features/notifications/composants/bouton-notifications-entete";
import { useNavigationReception } from "@/hooks/use-navigation-reception";
import type { UtilisateurReception } from "@/lib/auth/props-utilisateur-reception";
import { cn } from "@/lib/utils";

type PropsUtilisateurReception = UtilisateurReception;

interface PropsBarreLateraleReception {
  utilisateur: PropsUtilisateurReception;
  ouvert?: boolean;
  onFermer?: () => void;
}

function LiensNavigation({
  utilisateur,
  onFermer,
}: {
  utilisateur: PropsUtilisateurReception;
  onFermer?: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { principal, communication, parametres } = useNavigationReception();

  const estActif = (href: string) =>
    href === "/sigh/reception" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const lienClasse = (href: string) =>
    cn(
      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      estActif(href)
        ? "bg-bleu-medical text-white shadow-sm"
        : "text-texte-principal hover:bg-gris-tres-clair"
    );

  const deconnecter = async () => {
    onFermer?.();
    await fetch("/api/auth/deconnexion", { method: "POST" });
    router.push("/connexion");
    router.refresh();
  };

  return (
    <>
      <div className="flex items-start justify-between border-b border-gris-bordure px-4 py-4">
        <div className="min-w-0 flex-1">
          <LogoHam taille="petit" href="/sigh/reception" className="max-w-full" />
          <p className="mt-2 truncate text-[10px] font-medium uppercase tracking-wider text-texte-secondaire">
            SIGH — {INFORMATIONS_HOPITAL.nomCourt}
          </p>
        </div>
        {onFermer && (
          <button
            type="button"
            onClick={onFermer}
            className="ml-2 shrink-0 rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
            aria-label={t("reception.layout.fermerMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.layout.reception")}
        </p>
        <ul className="space-y-0.5">
          {principal.map((item) => {
            const Icone = item.icone;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onFermer}
                  className={lienClasse(item.href)}
                >
                  <Icone className="h-4 w-4 shrink-0" aria-hidden />
                  {item.etiquette}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.layout.communication")}
        </p>
        <ul className="space-y-0.5">
          {communication.map((item) => {
            const Icone = item.icone;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onFermer}
                  className={lienClasse(item.href)}
                >
                  <Icone className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{item.etiquette}</span>
                  {item.id === "messagerie" ? (
                    <BadgeMessagerieSidebar actif={estActif(item.href)} />
                  ) : item.id === "notifications" ? (
                    <BadgeNotificationsSidebar actif={estActif(item.href)} />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.layout.parametres")}
        </p>
        <ul className="space-y-0.5">
          {parametres.map((item) => {
            const Icone = item.icone;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onFermer}
                  className={lienClasse(item.href)}
                >
                  <Icone
                    className={cn(
                      "h-4 w-4 shrink-0",
                      !estActif(item.href) && "text-texte-secondaire"
                    )}
                    aria-hidden
                  />
                  {item.etiquette}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-gris-bordure p-3">
        <Link
          href="/sigh/reception/profil"
          onClick={onFermer}
          className="flex items-center gap-3 rounded-xl bg-gris-tres-clair p-3 transition-colors hover:bg-bleu-medical-clair/40"
        >
          <AvatarUtilisateur
            prenom={utilisateur.prenom}
            nom={utilisateur.nom}
            photoUrl={utilisateur.photoUrl}
            taille="md"
            forme="rond"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold capitalize text-texte-principal">
              {utilisateur.prenom} {utilisateur.nom.toLowerCase()}
            </p>
            <p className="truncate text-xs text-texte-secondaire">
              {traduireRoleHospitalier(utilisateur.role, t)}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-vert-sante">
              <span className="h-1.5 w-1.5 rounded-full bg-vert-sante" />
              {t("reception.layout.enLigne")}
            </p>
          </div>
        </Link>
        {onFermer && (
          <button
            type="button"
            onClick={deconnecter}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gris-bordure py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {t("reception.layout.deconnecter")}
          </button>
        )}
      </div>
    </>
  );
}

export function BarreLateraleReception({
  utilisateur,
  ouvert = false,
  onFermer,
}: PropsBarreLateraleReception) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!ouvert) return;
    const precedent = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = precedent;
    };
  }, [ouvert]);

  return (
    <>
      {/* Sidebar desktop — jamais visible sous lg */}
      <aside className="hidden h-full w-[260px] shrink-0 flex-col border-r border-gris-bordure bg-white lg:flex">
        <LiensNavigation utilisateur={utilisateur} />
      </aside>

      {/* Drawer mobile — monté uniquement quand ouvert */}
      {ouvert && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/45 lg:hidden"
            aria-label={t("reception.layout.fermerMenu")}
            onClick={onFermer}
          />
          <aside
            className="fixed inset-y-0 left-0 z-[60] flex w-[min(88vw,320px)] flex-col border-r border-gris-bordure bg-white shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
          >
            <LiensNavigation utilisateur={utilisateur} onFermer={onFermer} />
          </aside>
        </>
      )}
    </>
  );
}

interface PropsEnTeteSigh {
  titre: string;
  sousTitre: string;
  utilisateur: PropsUtilisateurReception;
  onMenu?: () => void;
}

export function EnTeteSigh({ titre, sousTitre, utilisateur, onMenu }: PropsEnTeteSigh) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-gris-bordure bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
      {/* Mobile */}
      <div className="flex items-center gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-4 sm:py-2.5 lg:hidden">
        <button
          type="button"
          onClick={onMenu}
          className="shrink-0 rounded-lg p-2 text-texte-principal hover:bg-gris-tres-clair"
          aria-label={t("reception.layout.ouvrirMenu")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <LogoHam
          taille="petit"
          href="/sigh/reception"
          afficherTexte={false}
          className="hidden shrink-0 sm:block"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-texte-principal">{titre}</h1>
          <p className="truncate text-[10px] text-texte-secondaire">{sousTitre}</p>
        </div>
        <SelecteurLangue variante="compacte" className="hidden shrink-0 sm:block" />
        <BoutonNotificationsEnTete />
        <MenuProfilEntete utilisateur={utilisateur} compact />
      </div>

      {/* Desktop */}
      <div className="hidden items-center justify-between gap-4 px-6 py-4 lg:flex">
        <div>
          <h1 className="text-lg font-bold text-texte-principal">{titre}</h1>
          <p className="text-sm text-texte-secondaire">{sousTitre}</p>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <RecherchePatientEnTete />

          <SelecteurLangue />

          <BoutonNotificationsEnTete />

          <MenuProfilEntete utilisateur={utilisateur} />
        </div>
      </div>
    </header>
  );
}
