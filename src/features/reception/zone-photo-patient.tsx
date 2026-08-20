"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TAILLE_MAX = 2 * 1024 * 1024;
const TYPES_AUTORISES = ["image/jpeg", "image/jpg", "image/png"];

interface PropsZonePhotoPatient {
  value: File | null;
  onChange: (fichier: File | null) => void;
  onErreur?: (message: string | null) => void;
  className?: string;
  /** Photo déjà enregistrée (URL publique) */
  urlExistante?: string | null;
  /** Zone compacte (aperçu gouvernance, avatar) */
  compact?: boolean;
  /** Appelé après retrait local (ex. DELETE API) */
  onRetirer?: () => void | Promise<void>;
}

export function ZonePhotoPatient({
  value,
  onChange,
  onErreur,
  className,
  urlExistante = null,
  compact = false,
  onRetirer,
}: PropsZonePhotoPatient) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [apercuLocal, setApercuLocal] = useState<string | null>(null);
  const [ignorerUrlExistante, setIgnorerUrlExistante] = useState(false);
  const [glisser, setGlisser] = useState(false);

  const apercu = apercuLocal ?? (ignorerUrlExistante ? null : urlExistante);

  useEffect(() => {
    if (!value) setApercuLocal(null);
  }, [value]);

  useEffect(() => {
    setIgnorerUrlExistante(false);
  }, [urlExistante]);

  const traiterFichier = useCallback(
    (fichier: File | null) => {
      if (!fichier) {
        onChange(null);
        setApercuLocal(null);
        onErreur?.(null);
        return;
      }

      if (!TYPES_AUTORISES.includes(fichier.type)) {
        onErreur?.(t("reception.photo.formatInvalide"));
        return;
      }
      if (fichier.size > TAILLE_MAX) {
        onErreur?.(t("reception.photo.tailleMax"));
        return;
      }

      onErreur?.(null);
      setIgnorerUrlExistante(false);
      onChange(fichier);
      const url = URL.createObjectURL(fichier);
      setApercuLocal((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    },
    [onChange, onErreur, t]
  );

  const retirer = async () => {
    traiterFichier(null);
    setIgnorerUrlExistante(true);
    if (inputRef.current) inputRef.current.value = "";
    if (onRetirer) await onRetirer();
  };

  return (
    <div className={cn(compact && "w-24", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="sr-only"
        onChange={(e) => traiterFichier(e.target.files?.[0] ?? null)}
      />

      {apercu ? (
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-xl border border-gris-bordure bg-gris-tres-clair/60 p-1",
            compact ? "h-24 w-24" : "h-36"
          )}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 z-0"
            aria-label={t("reception.photo.depot")}
            title={t("reception.photo.depot")}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={apercu}
            alt={t("reception.photo.apercu")}
            className={cn(
              "pointer-events-none relative z-[1] max-h-full max-w-full",
              compact ? "h-full w-full object-cover" : "object-contain"
            )}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void retirer();
            }}
            className="absolute right-1.5 top-1.5 z-10 rounded-full bg-white/95 p-1 text-texte-secondaire shadow hover:bg-white hover:text-red-600"
            aria-label={t("reception.photo.retirer")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setGlisser(true);
          }}
          onDragLeave={() => setGlisser(false)}
          onDrop={(e) => {
            e.preventDefault();
            setGlisser(false);
            traiterFichier(e.dataTransfer.files?.[0] ?? null);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-gris-tres-clair/40 text-center transition-colors",
            compact ? "h-24 w-24 gap-0.5 p-1.5" : "h-36 p-4",
            glisser
              ? "border-bleu-medical bg-bleu-medical-clair/30"
              : "border-gris-bordure hover:border-bleu-medical hover:bg-bleu-medical-clair/30"
          )}
        >
          <Upload
            className={cn(
              "text-bleu-medical",
              compact ? "mb-0.5 h-5 w-5" : "mb-2 h-8 w-8"
            )}
            strokeWidth={1.5}
          />
          {!compact ? (
            <>
              <span className="block text-sm font-semibold text-texte-principal">
                {t("reception.photo.depot")}
              </span>
              <span className="mt-1 block text-xs text-texte-secondaire">
                {t("reception.photo.format")}
              </span>
            </>
          ) : (
            <span className="px-0.5 text-[9px] font-medium leading-tight text-texte-secondaire">
              PNG / JPG
            </span>
          )}
        </button>
      )}

      {value && !apercuLocal && !compact && (
        <p className="mt-2 truncate text-xs text-texte-secondaire">{value.name}</p>
      )}
    </div>
  );
}
