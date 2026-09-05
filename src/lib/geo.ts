import { area } from "@turf/area";
import { polygon } from "@turf/helpers";
import type { LatLng } from "@/types";

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

// Çukurova/Adana bölgesi — parsel konumu bilinmediğinde haritanın açılacağı varsayılan nokta.
export const DEFAULT_CENTER: LatLng = { lat: 37.05, lng: 35.5 };

// 1 dönüm (dekar) = 1000 m² — Türkiye'de tarım arazisi ölçümünde standart birim.
export function polygonAreaDonum(points: LatLng[]): number {
  if (points.length < 3) return 0;
  const ring = points.map((p) => [p.lng, p.lat]);
  ring.push(ring[0]);
  const squareMeters = area(polygon([ring]));
  return Math.round((squareMeters / 1_000) * 10) / 10;
}

export function polygonCentroid(points: LatLng[]): LatLng {
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 },
  );
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}

export function boundsOf(points: LatLng[]): [[number, number], [number, number]] | null {
  if (points.length === 0) return null;
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
