"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { MAPBOX_TOKEN, DEFAULT_CENTER } from "@/lib/geo";
import { updateParcelBoundaryAction } from "@/lib/actions";
import { MapboxTokenNotice } from "./MapboxTokenNotice";
import { MapAramaKutusu } from "./MapAramaKutusu";
import type { LatLng } from "@/types";

type SaveStatus = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; alanDonum: number } | { kind: "error"; message: string };

export function ParcelDrawMap({
  parcelId,
  initialSinir,
  initialKonum,
}: {
  parcelId: string;
  initialSinir?: LatLng[];
  initialKonum?: LatLng;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const center = initialKonum ?? initialSinir?.[0] ?? DEFAULT_CENTER;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [center.lng, center.lat],
      zoom: initialSinir ? 16 : 13,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: initialSinir && initialSinir.length >= 3 ? "simple_select" : "draw_polygon",
    });
    map.addControl(draw, "top-left");

    const persist = async (coords: LatLng[]) => {
      setStatus({ kind: "saving" });
      const result = await updateParcelBoundaryAction(parcelId, coords);
      if (result.ok) {
        setStatus({ kind: "saved", alanDonum: result.alanDonum });
      } else {
        setStatus({ kind: "error", message: result.error });
      }
    };

    const handleChange = () => {
      const data = draw.getAll();
      const feature = data.features[0];
      if (!feature || feature.geometry.type !== "Polygon") return;
      const ring = feature.geometry.coordinates[0];
      const coords: LatLng[] = ring.slice(0, -1).map(([lng, lat]) => ({ lat, lng }));
      persist(coords);
    };

    map.on("draw.create", handleChange);
    map.on("draw.update", handleChange);
    map.on("draw.delete", () => setStatus({ kind: "idle" }));

    map.on("load", () => {
      if (initialSinir && initialSinir.length >= 3) {
        draw.add({
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[...initialSinir.map((p) => [p.lng, p.lat]), [initialSinir[0].lng, initialSinir[0].lat]]],
          },
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parcelId]);

  if (!MAPBOX_TOKEN) return <MapboxTokenNotice />;

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      <MapAramaKutusu
        onSonucSecildi={(merkez) => mapRef.current?.flyTo({ center: [merkez.lng, merkez.lat], zoom: 16 })}
      />
      {status.kind !== "idle" && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 bg-white rounded-[10px] px-4 py-2.5 shadow-lg shadow-black/20 text-[13px] font-semibold flex items-center gap-2">
          {status.kind === "saving" && <span className="text-text-secondary">Kaydediliyor...</span>}
          {status.kind === "saved" && <span className="text-primary">Kaydedildi · {status.alanDonum} dönüm</span>}
          {status.kind === "error" && <span className="text-red">{status.message}</span>}
        </div>
      )}
      <div className="absolute left-1/2 -translate-x-1/2 top-5 bg-white/95 rounded-[9px] px-3.5 py-2 shadow-md shadow-black/10 text-[12px] text-text-secondary max-w-[280px] text-center">
        Sol üstteki çokgen aracıyla parsel sınırını çizip son noktaya tekrar tıklayarak kapatın.
      </div>
    </div>
  );
}
