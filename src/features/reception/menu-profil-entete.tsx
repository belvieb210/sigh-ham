"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, UserCircle } from "lucide-react";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import type { UtilisateurReception } from "@/lib/auth/props-utilisateur-reception";

interface PropsMenuProfilEntete {
  utilisateur: UtilisateurReception;
  compact?: boolean;
  hrefProfil?: string;
}

export function MenuProfilEntete({
  utilisateur,
  compact = false,
  hrefProfil = "/sigh/reception/profil",
}: PropsMenuProfilEntete) {
  const { t } = useTranslation();
  const router = useRouter();

  const deconnecter = async () => {
    await fetch("/api/auth/deconnexion", { method: "POST" });
    router.push("/connexion");
    router.refresh();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={
            compact
              ? "relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bleu-medical"
              : "flex items-center gap-2 rounded-xl border border-gris-bordure bg-white py-1.5 pl-1.5 pr-2 transition-colors hover:bg-gris-tres-clair/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bleu-medical"
          }
          aria-label={t("reception.layout.profil")}
        >
          <div className="relative">
            <AvatarUtilisateur
              prenom={utilisateur.prenom}
              nom={utilisateur.nom}
              photoUrl={utilisateur.photoUrl}
              taille="sm"
              forme={compact ? "rond" : "carre"}
              className={compact ? "ring-2 ring-white" : undefined}
            />
            {compact && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-vert-sante" />
            )}
          </div>
          {!compact && (
            <>
              <div className="hidden text-left xl:block">
                <p className="text-sm font-semibold capitalize leading-tight text-texte-principal">
                  {utilisateur.prenom} {utilisateur.nom.toLowerCase()}
                </p>
                <p className="text-xs text-texte-secondaire">
                  {traduireRoleHospitalier(utilisateur.role, t)}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-texte-secondaire" />
            </>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[80] min-w-[220px] overflow-hidden rounded-xl border border-gris-bordure bg-white p-1 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="border-b border-gris-bordure px-3 py-2.5">
            <p className="truncate text-sm font-semibold capitalize text-texte-principal">
              {utilisateur.prenom} {utilisateur.nom.toLowerCase()}
            </p>
            <p className="truncate text-xs text-texte-secondaire">
              {traduireRoleHospitalier(utilisateur.role, t)}
            </p>
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href={hrefProfil}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-texte-principal outline-none transition-colors hover:bg-bleu-medical-clair/40 focus:bg-bleu-medical-clair/40"
            >
              <UserCircle className="h-4 w-4 text-bleu-medical" />
              {t("reception.nav.profil")}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-gris-bordure" />

          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={() => void deconnecter()}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 outline-none transition-colors hover:bg-red-50 focus:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t("reception.layout.deconnecter")}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
