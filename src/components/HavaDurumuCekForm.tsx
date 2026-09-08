"use client";

import { useState, useTransition } from "react";
import { haftalikSicaklikCekAction } from "@/lib/actions";
import { Button } from "@/components/ui/button/Button";

export function HavaDurumuCekForm({ customerId }: { customerId: string }) {
  const [haftaBaslangic, setHaftaBaslangic] = useState("");
  const [durum, setDurum] = useState<{ tip: "hata" | "basari"; mesaj: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const cek = () => {
    if (!haftaBaslangic) {
      setDurum({ tip: "hata", mesaj: "Önce hafta başlangıcı seç." });
      return;
    }
    setDurum(null);
    startTransition(async () => {
      const sonuc = await haftalikSicaklikCekAction(customerId, haftaBaslangic);
      if (sonuc.ok) {
        setDurum({ tip: "basari", mesaj: "Hafta hava durumundan dolduruldu." });
      } else {
        setDurum({ tip: "hata", mesaj: sonuc.error });
      }
    });
  };

  return (
    <div className="bg-cream rounded-xl p-4 mb-4">
      <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1">Hava Durumundan Otomatik Çek</div>
      <div className="text-[11.5px] text-text-secondary mb-3">
        Parsellerin konumuna göre Open-Meteo&apos;dan o haftanın ortalama/min/maks sıcaklığını çeker (aynı hafta varsa günceller).
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={haftaBaslangic}
          onChange={(e) => setHaftaBaslangic(e.target.value)}
          disabled={pending}
          className="flex-1 border border-border rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-primary bg-white disabled:opacity-50"
        />
        <Button type="button" onClick={cek} disabled={pending} size="sm" className="whitespace-nowrap">
          {pending ? "Çekiliyor…" : "Otomatik Çek"}
        </Button>
      </div>
      {durum && (
        <div className={`text-[11.5px] font-semibold mt-2 ${durum.tip === "hata" ? "text-red" : "text-primary"}`}>
          {durum.mesaj}
        </div>
      )}
    </div>
  );
}
