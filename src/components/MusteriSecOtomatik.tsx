"use client";

import { useRouter } from "next/navigation";
import type { Customer } from "@/types";

export function MusteriSecOtomatik({
  musteriler,
  secilen,
  hedefYol,
}: {
  musteriler: Customer[];
  secilen: string;
  hedefYol: string;
}) {
  const router = useRouter();

  return (
    <select
      defaultValue={secilen}
      onChange={(e) => router.push(`${hedefYol}?musteriId=${e.target.value}`)}
      className="border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white min-w-[240px]"
    >
      <option value="" disabled>
        Seçin
      </option>
      {musteriler.map((m) => (
        <option key={m.id} value={m.id}>
          {m.ad}
        </option>
      ))}
    </select>
  );
}
