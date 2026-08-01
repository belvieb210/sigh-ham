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
}

export function ZonePhotoPatient({
  value,
  onChange,
  onErreur,
  className,
  urlExistante = null,
}: PropsZonePhotoPatient) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [apercuLocal, setApercuLocal] = useState<string | null>(null);
  const [glisser, setGlisser] = useState(false);

  const apercu = apercuLocal ?? urlExistante;

  useEffect(() => {
    if (!value) setApercuLocal(null);
  }, [value, urlExistante]);

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
      onChange(fichier);
      const url = URL.createObjectURL(fichier);
      setApercuLocal((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    },
    [onChange, onErreur, t]
  );

  const retirer = () => {
    traiterFichier(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="sr-only"
        onChange={(e) => traiterFichier(e.target.files?.[0] ?? null)}
      />

      {apercu ? (
        <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl border border-gris-bordure bg-gris-tres-clair/60 p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={apercu}
            alt={t("reception.photo.apercu")}
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={retirer}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-texte-secondaire shadow hover:bg-white hover:text-red-600"
            aria-label={t("reception.photo.retirer")}
          >
            <X className="h-4 w-4" />
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
            "flex h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-gris-tres-clair/40 p-4 text-center transition-colors",
            glisser
              ? "border-bleu-medical bg-bleu-medical-clair/30"
              : "border-gris-bordure hover:border-bleu-medical hover:bg-bleu-medical-clair/30"
          )}
        >
          <Upload className="mb-2 h-8 w-8 text-bleu-medical" strokeWidth={1.5} />
          <span className="block text-sm font-semibold text-texte-principal">
            {t("reception.photo.depot")}
          </span>
          <span className="mt-1 block text-xs text-texte-secondaire">
            {t("reception.photo.format")}
          </span>
        </button>
      )}

      {value && !apercuLocal && (
        <p className="mt-2 truncate text-xs text-texte-secondaire">{value.name}</p>
      )}
    </div>
  );
}
