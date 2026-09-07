"use client";

import { useRouter } from "next/navigation";
import type { TopraqCustomer } from "@/lib/topraq";

export function TopraqCiftlikSec({ ciftlikler, secilen }: { ciftlikler: TopraqCustomer[]; secilen: string }) {
  const router = useRouter();

  return (
    <select
      defaultValue={secilen}
      onChange={(e) => router.push(`/toprak?cid=${e.target.value}`)}
      className="border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white min-w-[280px]"
    >
      <option value="" disabled>
        Seçin
      </option>
      {ciftlikler.map((c) => (
        <option key={c.id} value={c.id}>
          {c.full_name}
        </option>
      ))}
    </select>
  );
}
