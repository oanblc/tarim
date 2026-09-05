"use client";

import { useTransition } from "react";
import { updateGorevDurumAction } from "@/lib/actions";
import { GOREV_DURUM_LABEL, GOREV_DURUM_STYLE } from "./icons";
import type { GorevDurum } from "@/types";

const DURUMLAR: GorevDurum[] = ["planlandi", "devam_ediyor", "takip_ediliyor", "bekliyor", "kritik", "acil", "tamamlandi"];

export function GorevDurumSelect({
  gorevId,
  parcelId,
  durum,
}: {
  gorevId: string;
  parcelId: string;
  durum: GorevDurum;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={durum}
      disabled={pending}
      onChange={(e) => {
        const yeni = e.target.value as GorevDurum;
        startTransition(async () => {
          await updateGorevDurumAction(gorevId, parcelId, yeni);
        });
      }}
      className={`text-[11.5px] font-bold rounded-full border-0 px-3 py-1.5 outline-none cursor-pointer disabled:opacity-50 ${GOREV_DURUM_STYLE[durum]}`}
    >
      {DURUMLAR.map((d) => (
        <option key={d} value={d}>
          {GOREV_DURUM_LABEL[d]}
        </option>
      ))}
    </select>
  );
}
