"use client";

import { useRouter } from "next/navigation";
import type { Parcel } from "@/types";

export function ParselSecOtomatik({
  parseller,
  secilen,
  musteriId,
  hedefYol,
}: {
  parseller: Parcel[];
  secilen: string;
  musteriId: string;
  hedefYol: string;
}) {
  const router = useRouter();

  return (
    <select
      defaultValue={secilen}
      onChange={(e) => router.push(`${hedefYol}?musteriId=${musteriId}&parcelId=${e.target.value}`)}
      className="border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white min-w-[240px]"
    >
      <option value="" disabled>
        Seçin
      </option>
      {parseller.map((p) => (
        <option key={p.id} value={p.id}>
          {p.ad}
        </option>
      ))}
    </select>
  );
}
