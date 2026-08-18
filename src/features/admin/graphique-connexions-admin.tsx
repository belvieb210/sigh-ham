"use client";

import { useState } from "react";

export type PointConnexion = { date: string; valeur: number };

export function GraphiqueConnexionsAdmin({
  points,
  labelSerie,
  locale,
}: {
  points: PointConnexion[];
  labelSerie: string;
  locale: string;
}) {
  const [survol, setSurvol] = useState<number | null>(null);
  const largeur = 420;
  const hauteur = 200;
  const margeGauche = 28;
  const margeDroite = 10;
  const margeHaut = 16;
  const margeBas = 28;
  const zoneW = largeur - margeGauche - margeDroite;
  const zoneH = hauteur - margeHaut - margeBas;
  const maxValeur = Math.max(...points.map((p) => p.valeur), 1);
  const maxAxe = maxValeur * 1.2;
  const ticks = [0, 0.5, 1].map((t) => t * maxAxe);

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? margeGauche + zoneW / 2
        : margeGauche + (i / (points.length - 1)) * zoneW;
    const y = margeHaut + zoneH - (p.valeur / maxAxe) * zoneH;
    return { x, y, ...p };
  });

  const ligne = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const aire =
    coords.length > 0
      ? `${ligne} L ${coords[coords.length - 1]!.x} ${margeHaut + zoneH} L ${coords[0]!.x} ${margeHaut + zoneH} Z`
      : "";

  const pointActif = survol != null ? coords[survol] : null;
  const labelDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${largeur} ${hauteur}`}
        className="h-44 w-full sm:h-48"
        role="img"
        aria-label={labelSerie}
      >
        <defs>
          <linearGradient id="fillConnexionsAdmin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => {
          const y = margeHaut + zoneH - (tick / maxAxe) * zoneH;
          return (
            <g key={tick}>
              <line
                x1={margeGauche}
                y1={y}
                x2={largeur - margeDroite}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={margeGauche - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400"
                fontSize="9"
              >
                {Math.round(tick)}
              </text>
            </g>
          );
        })}
        {aire ? <path d={aire} fill="url(#fillConnexionsAdmin)" /> : null}
        {ligne ? (
          <path
            d={ligne}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
        {coords.map((c, i) => (
          <g key={c.date}>
            <circle
              cx={c.x}
              cy={c.y}
              r={survol === i ? 5 : 3.5}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth="2"
              className="cursor-pointer"
              onMouseEnter={() => setSurvol(i)}
              onMouseLeave={() => setSurvol(null)}
            />
            <text
              x={c.x}
              y={hauteur - 8}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize="9"
            >
              {labelDate(c.date)}
            </text>
          </g>
        ))}
      </svg>
      {pointActif ? (
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-lg border border-gris-bordure bg-white px-3 py-1.5 text-center text-xs shadow-md">
          <p className="font-medium text-texte-principal">
            {new Date(
              Number(pointActif.date.slice(0, 4)),
              Number(pointActif.date.slice(5, 7)) - 1,
              Number(pointActif.date.slice(8, 10))
            ).toLocaleDateString(locale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
          <p className="text-texte-secondaire">
            {labelSerie} :{" "}
            <span className="font-semibold text-bleu-medical">{pointActif.valeur}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
