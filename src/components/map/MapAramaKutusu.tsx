"use client";

import { useState } from "react";
import { SearchIcon } from "@/components/icons";
import { MAPBOX_TOKEN } from "@/lib/geo";

export function MapAramaKutusu({ onSonucSecildi }: { onSonucSecildi: (merkez: { lat: number; lng: number }) => void }) {
  const [sorgu, setSorgu] = useState("");
  const [ariyor, setAriyor] = useState(false);
  const [hata, setHata] = useState("");

  // "36.910199, 35.372677" gibi enlem,boylam çiftini yakalar — Google Maps'ten
  // kopyalanan koordinatlar doğrudan bu formatta yapıştırılabilsin diye.
  const koordinatAyikla = (metin: string): { lat: number; lng: number } | null => {
    const eslesme = metin.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (!eslesme) return null;
    const lat = Number(eslesme[1]);
    const lng = Number(eslesme[2]);
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return { lat, lng };
  };

  const ara = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sorgu.trim()) return;
    setAriyor(true);
    setHata("");
    try {
      const koordinat = koordinatAyikla(sorgu);
      if (koordinat) {
        onSonucSecildi(koordinat);
        return;
      }

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(sorgu)}.json?access_token=${MAPBOX_TOKEN}&country=tr&language=tr&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      const ilkSonuc = data.features?.[0];
      if (!ilkSonuc) {
        setHata("Sonuç bulunamadı.");
        return;
      }
      const [lng, lat] = ilkSonuc.center;
      onSonucSecildi({ lat, lng });
    } catch {
      setHata("Arama başarısız oldu.");
    } finally {
      setAriyor(false);
    }
  };

  return (
    <form onSubmit={ara} className="absolute right-[10px] top-[62px] z-10 flex flex-col gap-1 items-end">
      <div className="flex items-center gap-1.5 bg-white rounded-[9px] px-3 py-2 shadow-md shadow-black/10">
        <SearchIcon size={14} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          placeholder="Adres, yer veya enlem, boylam ara..."
          className="text-[12.5px] outline-none w-[190px]"
        />
        <button
          type="submit"
          disabled={ariyor}
          className="text-[11.5px] font-bold text-primary shrink-0 disabled:opacity-50"
        >
          {ariyor ? "..." : "Ara"}
        </button>
      </div>
      {hata && (
        <div className="bg-white rounded-[8px] px-3 py-1.5 shadow-md shadow-black/10 text-[11px] text-red">{hata}</div>
      )}
    </form>
  );
}
