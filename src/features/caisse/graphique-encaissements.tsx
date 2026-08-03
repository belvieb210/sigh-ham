"use client";

import type { PointEvolutionEncaissement } from "@/lib/caisse/types";

interface PropsGraphiqueEncaissements {
  points: PointEvolutionEncaissement[];
  labelAxeY: string;
  labelSerie: string;
}

function formaterAxe(montant: number) {
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(1)}M`;
  if (montant >= 1_000) return `${Math.round(montant / 1_000)}k`;
  return String(Math.round(montant));
}

export function GraphiqueEncaissements({
  points,
  labelAxeY,
  labelSerie,
}: PropsGraphiqueEncaissements) {
  const largeur = 420;
  const hauteur = 220;
  const margeGauche = 44;
  const margeDroite = 12;
  const margeHaut = 16;
  const margeBas = 36;
  const zoneW = largeur - margeGauche - margeDroite;
  const zoneH = hauteur - margeHaut - margeBas;

  const maxMontant = Math.max(...points.map((p) => p.montant), 1);
  const maxAxe = maxMontant * 1.15;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxAxe);

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? margeGauche + zoneW / 2
        : margeGauche + (i / (points.length - 1)) * zoneW;
    const y = margeHaut + zoneH - (p.montant / maxAxe) * zoneH;
    return { x, y, ...p };
  });

  const ligne = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const aire =
    coords.length > 0
      ? `${ligne} L ${coords[coords.length - 1]!.x} ${margeHaut + zoneH} L ${coords[0]!.x} ${margeHaut + zoneH} Z`
      : "";

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${largeur} ${hauteur}`}
        className="h-56 w-full"
        role="img"
        aria-label={labelSerie}
      >
        <defs>
          <linearGradient id="fillEncaissements" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
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
                x={margeGauche - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400"
                fontSize="9"
              >
                {formaterAxe(tick)}
              </text>
            </g>
          );
        })}

        <text
          x={12}
          y={12}
          className="fill-slate-400"
          fontSize="9"
          transform={`rotate(-90 12 ${hauteur / 2})`}
          textAnchor="middle"
        >
          {labelAxeY}
        </text>

        {aire ? <path d={aire} fill="url(#fillEncaissements)" /> : null}
        {ligne ? <path d={ligne} fill="none" stroke="#2563eb" strokeWidth="2.5" /> : null}

        {coords.map((c) => (
          <g key={c.date}>
            <circle cx={c.x} cy={c.y} r="4" fill="#2563eb" stroke="#fff" strokeWidth="2" />
            <text
              x={c.x}
              y={hauteur - 10}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize="9"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-1 flex items-center justify-center gap-2 text-xs text-texte-secondaire">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
        {labelSerie}
      </div>
    </div>
  );
}
