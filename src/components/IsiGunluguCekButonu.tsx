"use client";

import { useState, useTransition } from "react";
import { isiGunlukBackfillAction } from "@/lib/actions";

export function IsiGunluguCekButonu({ customerId }: { customerId: string }) {
  const [durum, setDurum] = useState<{ tip: "hata" | "basari"; mesaj: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const cek = () => {
    setDurum(null);
    startTransition(async () => {
      const sonuc = await isiGunlukBackfillAction(customerId, 30);
      if (sonuc.ok) {
        setDurum({ tip: "basari", mesaj: `${sonuc.islenenGun} gün güncellendi.` });
        window.location.reload();
      } else {
        setDurum({ tip: "hata", mesaj: sonuc.error });
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={cek}
        disabled={pending}
        className="px-4 py-2 rounded-[9px] bg-primary text-cream text-[12.5px] font-bold whitespace-nowrap disabled:opacity-60"
      >
        {pending ? "Çekiliyor…" : "Son 30 Günü Çek"}
      </button>
      {durum && (
        <span className={`text-[11.5px] font-semibold ${durum.tip === "hata" ? "text-red" : "text-primary"}`}>
          {durum.mesaj}
        </span>
      )}
    </div>
  );
}
