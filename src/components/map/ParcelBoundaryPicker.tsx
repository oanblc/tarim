"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { MAPBOX_TOKEN, DEFAULT_CENTER, polygonAreaDonum } from "@/lib/geo";
import { MapboxTokenNotice } from "./MapboxTokenNotice";
import { MapAramaKutusu } from "./MapAramaKutusu";
import type { LatLng } from "@/types";

// Yeni parsel oluşturma akışında haritayı ilk adıma taşır: henüz veritabanında
// bir parcelId yoktur, bu yüzden ParcelDrawMap'in aksine hiçbir şeyi sunucuya
// yazmaz — çizilen sınırı sadece yerel state'te tutar, "Devam Et" ile
// üst bileşene (ParselEkleWizard) teslim eder.
export function ParcelBoundaryPicker({
  initialSinir,
  onDevamEt,
}: {
  initialSinir?: LatLng[];
  onDevamEt: (sinir: LatLng[], alanDonum: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [sinir, setSinir] = useState<LatLng[] | null>(initialSinir && initialSinir.length >= 3 ? initialSinir : null);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const center = initialSinir?.[0] ?? DEFAULT_CENTER;
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

    const handleChange = () => {
      const data = draw.getAll();
      const feature = data.features[0];
      if (!feature || feature.geometry.type !== "Polygon") {
        setSinir(null);
        return;
      }
      const ring = feature.geometry.coordinates[0];
      setSinir(ring.slice(0, -1).map(([lng, lat]) => ({ lat, lng })));
    };

    map.on("draw.create", handleChange);
    map.on("draw.update", handleChange);
    map.on("draw.delete", () => setSinir(null));

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
  }, []);

  if (!MAPBOX_TOKEN) return <MapboxTokenNotice />;

  const alanDonum = sinir ? polygonAreaDonum(sinir) : 0;

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      <MapAramaKutusu
        onSonucSecildi={(merkez) => mapRef.current?.flyTo({ center: [merkez.lng, merkez.lat], zoom: 16 })}
      />
      <div className="absolute left-1/2 -translate-x-1/2 top-5 bg-white/95 rounded-[9px] px-3.5 py-2 shadow-md shadow-black/10 text-[12px] text-text-secondary max-w-[300px] text-center">
        Sol üstteki çokgen aracıyla parsel sınırını çizip son noktaya tekrar tıklayarak kapatın.
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-5 bg-white rounded-[10px] px-4 py-2.5 shadow-lg shadow-black/20 flex items-center gap-3">
        {sinir ? (
          <>
            <span className="text-[13px] font-semibold text-primary">{alanDonum} dönüm çizildi</span>
            <button
              type="button"
              onClick={() => onDevamEt(sinir, alanDonum)}
              className="px-4 py-1.5 rounded-[8px] bg-primary text-cream text-[12.5px] font-bold"
            >
              Devam Et →
            </button>
          </>
        ) : (
          <span className="text-[13px] text-text-secondary">Devam etmek için önce bir sınır çiz</span>
        )}
      </div>
    </div>
  );
}
