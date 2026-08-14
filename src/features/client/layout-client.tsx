"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { LogOut, Menu, X } from "lucide-react";
import { LogoHam } from "@/components/brand/logo-ham";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import { SelecteurLangue } from "@/components/ui/selecteur-langue";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { MenuProfilEntete } from "@/features/reception/menu-profil-entete";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import { BadgeMessagerieSidebar } from "@/features/messagerie/badge-messagerie-sidebar";
import { BadgeNotificationsSidebar } from "@/features/notifications/badge-notifications-sidebar";
import { BoutonNotificationsEnTete } from "@/features/notifications/composants/bouton-notifications-entete";
import { useNavigationClient } from "@/hooks/use-navigation-client";
import { useBrandingRuntime } from "@/hooks/use-branding-runtime";
import type { UtilisateurClient } from "@/lib/auth/props-utilisateur-client";
import { cn } from "@/lib/utils";

interface PropsBarreLaterale {
  utilisateur: UtilisateurClient;
  ouvert?: boolean;
  onFermer?: () => void;
}

function LiensNavigation({
  utilisateur,
  onFermer,
}: {
  utilisateur: UtilisateurClient;
  onFermer?: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const branding = useBrandingRuntime();
  const { principal, contenu, communication, compte } = useNavigationClient();

  const estActif = (href: string) =>
    href === "/sigh/client"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

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

  type ItemNav = {
    href: string;
    id: string;
    icone: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    etiquette: string;
  };

  const rendreSection = (titre: string, items: ItemNav[]) => (
    <>
      <p className="mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-widest text-texte-secondaire first:mt-0">
        {titre}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icone = item.icone;
          return (
            <li key={item.href}>
              <Link href={item.href} onClick={onFermer} className={lienClasse(item.href)}>
                <Icone className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{item.etiquette}</span>
                {item.id === "messagerie" ? (
                  <BadgeMessagerieSidebar actif={estActif(item.href)} />
                ) : null}
                {item.id === "notifications" ? (
                  <BadgeNotificationsSidebar actif={estActif(item.href)} />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <>
      <div className="flex items-start justify-between border-b border-gris-bordure px-4 py-4">
        <div className="min-w-0 flex-1">
          <LogoHam taille="petit" href="/sigh/client" className="max-w-full" />
          <p className="mt-2 truncate text-[10px] font-medium uppercase tracking-wider text-texte-secondaire">
            SIGH — {branding.nomCourt || INFORMATIONS_HOPITAL.nomCourt}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-bleu-medical">
            {t("client.layout.badgeClient")}
          </p>
        </div>
        {onFermer && (
          <button
            type="button"
            onClick={onFermer}
            className="ml-2 shrink-0 rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
            aria-label={t("client.layout.fermerMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {rendreSection(t("client.layout.sectionPrincipal"), principal)}
        {rendreSection(t("client.layout.sectionContenu"), contenu)}
        {rendreSection(t("client.layout.sectionCommunication"), communication)}
        {rendreSection(t("client.layout.sectionCompte"), compte)}
      </nav>

      <div className="space-y-2 border-t border-gris-bordure p-3">
        <Link
          href="/sigh/client/profil"
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
          </div>
        </Link>
        {onFermer && (
          <button
            type="button"
            onClick={deconnecter}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gris-bordure py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {t("client.layout.deconnecter")}
          </button>
        )}
      </div>
    </>
  );
}

export function BarreLateraleClient({
  utilisateur,
  ouvert = false,
  onFermer,
}: PropsBarreLaterale) {
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
      <aside className="hidden h-full w-[270px] shrink-0 flex-col border-r border-gris-bordure bg-white lg:flex">
        <LiensNavigation utilisateur={utilisateur} />
      </aside>

      {ouvert && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/45 lg:hidden"
            aria-label={t("client.layout.fermerMenu")}
            onClick={onFermer}
          />
          <aside
            className="fixed inset-y-0 left-0 z-[60] flex w-[min(88vw,320px)] flex-col border-r border-gris-bordure bg-white shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <LiensNavigation utilisateur={utilisateur} onFermer={onFermer} />
          </aside>
        </>
      )}
    </>
  );
}

export function EnTeteClient({
  titre,
  sousTitre,
  utilisateur,
  onMenu,
}: {
  titre: string;
  sousTitre: string;
  utilisateur: UtilisateurClient;
  onMenu?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-gris-bordure bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
      <div className="flex items-center gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-4 sm:py-2.5 lg:hidden">
        <button
          type="button"
          onClick={onMenu}
          className="shrink-0 rounded-lg p-2 text-texte-principal hover:bg-gris-tres-clair"
          aria-label={t("client.layout.ouvrirMenu")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-texte-principal">{titre}</h1>
          <p className="truncate text-[10px] text-texte-secondaire">{sousTitre}</p>
        </div>
        <SelecteurLangue variante="compacte" className="hidden shrink-0 sm:block" />
        <BoutonNotificationsEnTete />
        <MenuProfilEntete
          utilisateur={utilisateur}
          hrefProfil="/sigh/client/profil"
          compact
        />
      </div>

      <div className="hidden items-center justify-between gap-4 px-6 py-4 lg:flex">
        <div>
          <h1 className="text-lg font-bold text-texte-principal">{titre}</h1>
          <p className="text-sm text-texte-secondaire">{sousTitre}</p>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <SelecteurLangue />
          <BoutonNotificationsEnTete />
          <MenuProfilEntete
            utilisateur={utilisateur}
            hrefProfil="/sigh/client/profil"
          />
        </div>
      </div>
    </header>
  );
}
