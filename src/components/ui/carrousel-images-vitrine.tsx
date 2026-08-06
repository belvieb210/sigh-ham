"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { cn } from "@/lib/utils";

type Item = { url: string; legende?: string };

interface Props {
  images: Item[];
  className?: string;
  intervalleMs?: number;
  alt?: string;
  sizes?: string;
  showDots?: boolean;
  showNav?: boolean;
  fill?: boolean;
}

export function CarrouselImagesVitrine({
  images,
  className,
  intervalleMs = 4500,
  alt = "",
  sizes,
  showDots = true,
  showNav = true,
  fill = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const pause = useRef(false);
  const liste = images.filter((i) => i.url);

  const suivant = useCallback(() => {
    if (liste.length < 2) return;
    setIndex((i) => (i + 1) % liste.length);
  }, [liste.length]);

  const precedent = useCallback(() => {
    if (liste.length < 2) return;
    setIndex((i) => (i - 1 + liste.length) % liste.length);
  }, [liste.length]);

  useEffect(() => {
    if (liste.length < 2) return;
    const id = setInterval(() => {
      if (!pause.current) suivant();
    }, intervalleMs);
    return () => clearInterval(id);
  }, [liste.length, intervalleMs, suivant]);

  if (liste.length === 0) return null;

  const courante = liste[index] ?? liste[0];

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => {
        pause.current = true;
      }}
      onMouseLeave={() => {
        pause.current = false;
      }}
    >
      <ImageVitrine
        src={courante.url}
        alt={courante.legende || alt}
        fill={fill}
        className="object-cover transition-opacity duration-500"
        sizes={sizes}
      />

      {liste.length > 1 && showNav ? (
        <div className="absolute right-2 top-2 z-10 flex gap-1">
          <button
            type="button"
            aria-label="Précédent"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              precedent();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Suivant"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              suivant();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {liste.length > 1 && showDots ? (
        <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1">
          {liste.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Image ${i + 1}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIndex(i);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
