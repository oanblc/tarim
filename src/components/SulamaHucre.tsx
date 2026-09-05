"use client";

import { useState, useTransition } from "react";
import { updateSulamaSaatiAction } from "@/lib/actions";

export function SulamaHucre({ parcelId, tarih, ilkDeger }: { parcelId: string; tarih: string; ilkDeger?: number }) {
  const [deger, setDeger] = useState(ilkDeger !== undefined ? String(ilkDeger) : "");
  const [pending, startTransition] = useTransition();

  const kaydet = () => {
    const sayi = Number(deger.replace(",", "."));
    startTransition(async () => {
      await updateSulamaSaatiAction(parcelId, tarih, Number.isNaN(sayi) ? 0 : sayi);
    });
  };

  return (
    <input
      type="number"
      min={0}
      step={0.5}
      value={deger}
      disabled={pending}
      onChange={(e) => setDeger(e.target.value)}
      onBlur={kaydet}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      placeholder="—"
      className="w-14 text-center bg-transparent outline-none focus:bg-primary-bg rounded-[6px] py-1 disabled:opacity-50"
    />
  );
}
