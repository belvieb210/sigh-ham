"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { LogOut, Menu, Search, X } from "lucide-react";
import { LogoHam } from "@/components/brand/logo-ham";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import { SelecteurLangue } from "@/components/ui/selecteur-langue";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { MenuProfilEntete } from "@/features/reception/menu-profil-entete";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import { BadgeMessagerieSidebar } from "@/features/messagerie/badge-messagerie-sidebar";
import { BadgeNotificationsSidebar } from "@/features/notifications/badge-notifications-sidebar";
import { BoutonNotificationsEnTete } from "@/features/notifications/composants/bouton-notifications-entete";
import { useNavigationCaisse } from "@/hooks/use-navigation-caisse";
import type { UtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";
import { cn } from "@/lib/utils";

interface PropsBarreLateraleCaisse {
  utilisateur: UtilisateurCaisse;
  ouvert?: boolean;
  onFermer?: () => void;
  badgeFile?: number;
}

function LiensNavigation({
  utilisateur,
  onFermer,
  badgeFile = 0,
}: {
  utilisateur: UtilisateurCaisse;
  onFermer?: () => void;
  badgeFile?: number;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { accueil, caisse, rapports, parametres } = useNavigationCaisse();
  const heureOuverture = "08:15";

  const estActif = (href: string) => {
    if (href === "/sigh/caisse") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

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
    badge?: boolean;
  };

  const rendreSection = (titre: string, items: ItemNav[]) => (
    <>
      <p className="mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-widest text-texte-secondaire first:mt-0">
        {titre}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icone = item.icone;
          const afficherBadge = Boolean(item.badge) && badgeFile > 0;
          return (
            <li key={item.href}>
              <Link href={item.href} onClick={onFermer} className={lienClasse(item.href)}>
                <Icone className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{item.etiquette}</span>
                {afficherBadge ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      estActif(item.href)
                        ? "bg-white/20 text-white"
                        : "bg-bleu-medical text-white"
                    )}
                  >
                    {badgeFile}
                  </span>
                ) : null}
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
          <LogoHam taille="petit" href="/sigh/caisse" className="max-w-full" />
          <p className="mt-2 truncate text-[10px] font-medium uppercase tracking-wider text-texte-secondaire">
            SIGH — {INFORMATIONS_HOPITAL.nomCourt}
          </p>
        </div>
        {onFermer && (
          <button
            type="button"
            onClick={onFermer}
            className="ml-2 shrink-0 rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
            aria-label={t("caisse.layout.fermerMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {rendreSection(t("caisse.layout.sectionAccueil"), accueil as ItemNav[])}
        {rendreSection(t("caisse.layout.sectionCaisse"), caisse as ItemNav[])}
        {rendreSection(t("caisse.layout.sectionRapports"), rapports as ItemNav[])}
        {rendreSection(t("caisse.layout.sectionParametres"), parametres as ItemNav[])}
      </nav>

      <div className="space-y-2 border-t border-gris-bordure p-3">
        <div className="rounded-xl border border-bleu-medical/20 bg-bleu-medical-clair/30 p-3">
          <p className="text-xs font-semibold text-bleu-medical">
            {t("caisse.layout.sessionEnCours")}
          </p>
          <p className="mt-1 text-[11px] text-texte-secondaire">
            {t("caisse.layout.ouverteA", { heure: heureOuverture })} ·{" "}
            {t("caisse.layout.caisseNumero")}
          </p>
          <p className="mt-2 text-[11px] text-texte-secondaire">
            {t("caisse.layout.soldeOuverture")}
          </p>
          <p className="text-sm font-bold text-texte-principal">500,00 $</p>
          <button
            type="button"
            className="mt-2 w-full rounded-lg border border-gris-bordure bg-white px-2 py-1.5 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
          >
            {t("caisse.layout.cloturerSession")}
          </button>
        </div>

        <Link
          href="/sigh/caisse/profil"
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
            {t("caisse.layout.deconnecter")}
          </button>
        )}
      </div>
    </>
  );
}

export function BarreLateraleCaisse({
  utilisateur,
  ouvert = false,
  onFermer,
  badgeFile = 0,
}: PropsBarreLateraleCaisse) {
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
      <aside className="hidden h-full w-[260px] shrink-0 flex-col border-r border-gris-bordure bg-white lg:flex">
        <LiensNavigation utilisateur={utilisateur} badgeFile={badgeFile} />
      </aside>

      {ouvert && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/45 lg:hidden"
            aria-label={t("caisse.layout.fermerMenu")}
            onClick={onFermer}
          />
          <aside
            className="fixed inset-y-0 left-0 z-[60] flex w-[min(88vw,320px)] flex-col border-r border-gris-bordure bg-white shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <LiensNavigation
              utilisateur={utilisateur}
              onFermer={onFermer}
              badgeFile={badgeFile}
            />
          </aside>
        </>
      )}
    </>
  );
}

interface PropsEnTeteCaisse {
  titre: string;
  sousTitre: string;
  utilisateur: UtilisateurCaisse;
  onMenu?: () => void;
}

export function EnTeteCaisse({ titre, sousTitre, utilisateur, onMenu }: PropsEnTeteCaisse) {
  const { t } = useTranslation();
  const [recherche, setRecherche] = useState("");

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-gris-bordure bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:hidden">
        <button
          type="button"
          onClick={onMenu}
          className="shrink-0 rounded-lg p-2 text-texte-principal hover:bg-gris-tres-clair"
          aria-label={t("caisse.layout.ouvrirMenu")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <LogoHam taille="petit" href="/sigh/caisse" afficherTexte={false} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-bleu-medical sm:text-base">
            {t("caisse.layout.titre")}
          </h1>
          <p className="truncate text-[10px] text-texte-secondaire sm:text-[11px]">{sousTitre}</p>
        </div>
        <SelecteurLangue variante="compacte" className="shrink-0" />
        <BoutonNotificationsEnTete />
        <MenuProfilEntete utilisateur={utilisateur} compact hrefProfil="/sigh/caisse/profil" />
      </div>

      <div className="hidden items-center justify-between gap-4 px-6 py-4 lg:flex">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-texte-principal">{titre}</h1>
          <p className="text-sm text-texte-secondaire">{sousTitre}</p>
        </div>

        <div className="relative hidden min-w-0 flex-1 max-w-md xl:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("caisse.layout.rechercher")}
            className="w-full rounded-xl border border-gris-bordure bg-gris-tres-clair/50 py-2.5 pl-10 pr-20 text-sm outline-none focus:border-bleu-medical focus:ring-2 focus:ring-bleu-medical/20"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gris-bordure bg-white px-1.5 py-0.5 text-[10px] text-texte-secondaire">
            {t("caisse.layout.raccourciRecherche")}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <SelecteurLangue />
          <BoutonNotificationsEnTete />
          <MenuProfilEntete utilisateur={utilisateur} hrefProfil="/sigh/caisse/profil" />
        </div>
      </div>
    </header>
  );
}
