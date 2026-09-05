"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createGorevYeniAction, type CreateGorevYeniState } from "@/lib/actions";
import type { Customer, Parcel, User } from "@/types";

const KONULAR = ["Genel", "Gübreleme", "Sulama", "Toprak", "Budama", "Yabancı Ot", "Hastalık / Zararlı"];
const initialState: CreateGorevYeniState = null;

export function YeniGorevFormu({
  musteriler,
  parsellerByMusteri,
  kullanicilar,
  currentUserId,
}: {
  musteriler: Customer[];
  parsellerByMusteri: Record<string, Parcel[]>;
  kullanicilar: User[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(createGorevYeniAction, initialState);
  const [musteriId, setMusteriId] = useState("");
  const [parcelId, setParcelId] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const parseller = parsellerByMusteri[musteriId] ?? [];

  return (
    <form action={formAction} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
      <input type="hidden" name="parcelId" value={parcelId} />

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Müşteri</div>
          <select
            value={musteriId}
            onChange={(e) => {
              setMusteriId(e.target.value);
              setParcelId("");
            }}
            required
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
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
        </label>
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Parsel</div>
          <select
            value={parcelId}
            onChange={(e) => setParcelId(e.target.value)}
            required
            disabled={!musteriId}
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white disabled:opacity-50 disabled:bg-cream"
          >
            <option value="" disabled>
              {musteriId ? "Seçin" : "Önce müşteri seç"}
            </option>
            {parseller.map((p) => (
              <option key={p.id} value={p.id}>
                {p.ad}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Konu</div>
          <select
            name="konu"
            defaultValue={KONULAR[0]}
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
          >
            {KONULAR.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Tespit Tarihi</div>
          <input
            name="tarih"
            type="date"
            required
            defaultValue={today}
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Gözlem / Tespit</div>
        <textarea
          name="gozlem"
          required
          rows={3}
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Önerilen / Yapılan Uygulama (opsiyonel)</div>
        <textarea
          name="onerilenUygulama"
          rows={2}
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Termin Tarihi (opsiyonel)</div>
          <input
            name="terminTarihi"
            type="date"
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Durum</div>
          <select
            name="durum"
            defaultValue="planlandi"
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
          >
            <option value="planlandi">Planlandı</option>
            <option value="devam_ediyor">Devam Ediyor</option>
            <option value="takip_ediliyor">Takip Ediliyor</option>
            <option value="bekliyor">Bekliyor</option>
            <option value="kritik">Kritik Risk / Gecikme</option>
            <option value="acil">Acil</option>
            <option value="toplanti_gerekli">Toplantı Gerekli</option>
            <option value="tamamlandi">Tamamlandı</option>
          </select>
        </label>
      </div>

      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sorumlu</div>
        <select
          name="sorumluId"
          defaultValue={currentUserId}
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
        >
          {kullanicilar.map((k) => (
            <option key={k.id} value={k.id}>
              {k.ad}
              {k.id === currentUserId ? " (ben)" : ""}
            </option>
          ))}
        </select>
      </label>

      {state?.error && <div className="text-[12.5px] text-red bg-red-bg rounded-[9px] px-3.5 py-2.5">{state.error}</div>}

      <div className="flex gap-2.5 justify-end pt-2">
        <Link href="/gorevler" className="px-5 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]">
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={pending || !parcelId}
          className="px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold disabled:opacity-60"
        >
          {pending ? "Ekleniyor..." : "Görevi Ekle"}
        </button>
      </div>
    </form>
  );
}
