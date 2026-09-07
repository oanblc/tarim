"use client";

import { useMemo, useState } from "react";
import type { TopraqNemNoktasi } from "@/lib/topraq";

const DERINLIK_RENK: Record<"v20" | "v40" | "v60" | "v80", string> = {
  v20: "#E8A33D",
  v40: "#C17D3F",
  v60: "#8A6A3A",
  v80: "#5C4A30",
};

const W = 1000;
const H = 380;
const M = { top: 14, right: 14, bottom: 28, left: 40 };
const plotW = W - M.left - M.right;
const plotH = H - M.top - M.bottom;

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function xAt(i: number, n: number) {
  return M.left + (i / Math.max(1, n - 1)) * plotW;
}
function yAt(v: number, yMin: number, yMax: number) {
  return M.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;
}

export function NemIndeksiGrafik({ buckets }: { buckets: TopraqNemNoktasi[] }) {
  const [gorunur, setGorunur] = useState<Record<"v20" | "v40" | "v60" | "v80", boolean>>({
    v20: true,
    v40: true,
    v60: true,
    v80: true,
  });
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const n = buckets.length;

  const { yMin, yMax } = useMemo(() => {
    const all = buckets.flatMap((b) => [b.v20, b.v40, b.v60, b.v80, b.weighted]);
    const min = Math.min(...all);
    const max = Math.max(...all);
    const pad = Math.max(1, (max - min) * 0.08);
    return { yMin: Math.floor(min - pad), yMax: Math.ceil(max + pad) };
  }, [buckets]);

  const pathFor = (key: "v20" | "v40" | "v60" | "v80" | "weighted") =>
    buckets.map((b, i) => `${i === 0 ? "M" : "L"} ${xAt(i, n).toFixed(2)} ${yAt(b[key], yMin, yMax).toFixed(2)}`).join(" ");

  const gunEtiketleri = useMemo(() => {
    const etiketler: { i: number; label: string }[] = [];
    let son = "";
    buckets.forEach((b, i) => {
      const gun = b.t.slice(0, 10);
      if (gun !== son) {
        son = gun;
        const [, ay, gg] = gun.split("-").map(Number);
        etiketler.push({ i, label: `${gg} ${MONTHS[ay - 1]}` });
      }
    });
    return etiketler;
  }, [buckets]);

  const yTicks = useMemo(() => {
    const adim = Math.ceil((yMax - yMin) / 5 / 2) * 2 || 2;
    const ticks: number[] = [];
    for (let v = Math.ceil(yMin / adim) * adim; v <= yMax; v += adim) ticks.push(v);
    return ticks;
  }, [yMin, yMax]);

  const hover = hoverIdx !== null ? buckets[hoverIdx] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-3 text-[12px]">
        <span className="flex items-center gap-1.5 font-bold text-text">
          <span className="inline-block w-3.5 h-[3px] rounded bg-blue" />
          Ağırlıklı İndeks
        </span>
        {(["v20", "v40", "v60", "v80"] as const).map((k) => (
          <label key={k} className="flex items-center gap-1.5 text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={gorunur[k]}
              onChange={(e) => setGorunur((g) => ({ ...g, [k]: e.target.checked }))}
              className="accent-blue w-3.5 h-3.5 cursor-pointer"
            />
            <span className="inline-block w-3.5 h-[3px] rounded" style={{ background: DERINLIK_RENK[k] }} />
            {k.slice(1)} cm
          </label>
        ))}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block overflow-visible">
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={M.left} x2={W - M.right} y1={yAt(v, yMin, yMax)} y2={yAt(v, yMin, yMax)} stroke="var(--color-border)" strokeWidth={1} />
              <text x={M.left - 8} y={yAt(v, yMin, yMax) + 3} textAnchor="end" fontSize={10.5} fill="var(--color-text-muted)" fontFamily="ui-monospace, monospace">
                {v}%
              </text>
            </g>
          ))}

          {buckets.map((b, i) =>
            b.debi > 0 ? (
              <rect
                key={i}
                x={xAt(i, n) - plotW / (n - 1) / 2}
                y={M.top}
                width={plotW / (n - 1)}
                height={plotH}
                fill="var(--color-primary-bg)"
              />
            ) : null,
          )}

          {gunEtiketleri.map(({ i, label }) => (
            <g key={i}>
              <line x1={xAt(i, n)} x2={xAt(i, n)} y1={M.top} y2={M.top + plotH} stroke="var(--color-border)" strokeWidth={1} opacity={0.6} />
              <text x={xAt(i, n)} y={H - M.bottom + 16} fontSize={10.5} fill="var(--color-text-muted)" fontFamily="ui-monospace, monospace">
                {label}
              </text>
            </g>
          ))}

          {(["v20", "v40", "v60", "v80"] as const).map(
            (k) =>
              gorunur[k] && (
                <path key={k} d={pathFor(k)} fill="none" stroke={DERINLIK_RENK[k]} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
              ),
          )}
          <path d={pathFor("weighted")} fill="none" stroke="var(--color-blue)" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />

          {hover && (
            <>
              <line x1={xAt(hoverIdx!, n)} x2={xAt(hoverIdx!, n)} y1={M.top} y2={M.top + plotH} stroke="var(--color-text-muted)" strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={xAt(hoverIdx!, n)} cy={yAt(hover.weighted, yMin, yMax)} r={4} fill="var(--color-blue)" stroke="white" strokeWidth={2} />
            </>
          )}

          <rect
            x={M.left}
            y={M.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onMouseMove={(e) => {
              const svg = e.currentTarget.ownerSVGElement;
              if (!svg) return;
              const rect = svg.getBoundingClientRect();
              const scale = W / rect.width;
              const xInSvg = (e.clientX - rect.left) * scale;
              const idx = Math.round(((xInSvg - M.left) / plotW) * (n - 1));
              setHoverIdx(Math.max(0, Math.min(n - 1, idx)));
            }}
            onMouseLeave={() => setHoverIdx(null)}
          />
        </svg>

        {hover && (
          <div
            className="absolute pointer-events-none bg-forest text-cream rounded-[10px] px-3 py-2 text-[11.5px] leading-[1.5] shadow-lg whitespace-nowrap"
            style={{
              left: `${(xAt(hoverIdx!, n) / W) * 100}%`,
              top: `${(yAt(hover.weighted, yMin, yMax) / H) * 100}%`,
              transform: "translate(-50%, -115%)",
            }}
          >
            <div className="font-mono font-bold opacity-90 mb-0.5">{hover.t.replace("T", " ")}</div>
            <div className="flex justify-between gap-3">
              <span>Ağırlıklı</span>
              <b className="font-mono">%{hover.weighted.toFixed(1)}</b>
            </div>
            <div className="flex justify-between gap-3">
              <span>20 cm</span>
              <b className="font-mono">%{hover.v20.toFixed(1)}</b>
            </div>
            <div className="flex justify-between gap-3">
              <span>40 cm</span>
              <b className="font-mono">%{hover.v40.toFixed(1)}</b>
            </div>
            <div className="flex justify-between gap-3">
              <span>60 cm</span>
              <b className="font-mono">%{hover.v60.toFixed(1)}</b>
            </div>
            <div className="flex justify-between gap-3">
              <span>80 cm</span>
              <b className="font-mono">%{hover.v80.toFixed(1)}</b>
            </div>
            {hover.debi > 0 && (
              <div className="flex justify-between gap-3">
                <span>Debi</span>
                <b className="font-mono">{hover.debi.toFixed(0)} lt/sa</b>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-between text-[11px] text-text-muted mt-1.5">
        <span>Nem (%)</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary-bg border border-primary" />
          Sulama penceresi
        </span>
      </div>
    </div>
  );
}
