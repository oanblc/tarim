"use client";

import { useState } from "react";
import { createFertigasyonKaydiAction } from "@/lib/actions";
import { FERTIGASYON_BIRIM, FERTIGASYON_VARSAYILAN_AMBALAJ } from "@/lib/fertigasyon";
import type { FertigasyonUrun } from "@/types";

const URUNLER: FertigasyonUrun[] = ["AS21", "K2SO4", "H3PO4", "Demir"];

export function FertigasyonForm({ parcelId }: { parcelId: string }) {
  const [urun, setUrun] = useState<FertigasyonUrun>("AS21");
  const [ambalajBoyutu, setAmbalajBoyutu] = useState(FERTIGASYON_VARSAYILAN_AMBALAJ.AS21);
  const birim = FERTIGASYON_BIRIM[urun];

  const urunDegistir = (yeniUrun: FertigasyonUrun) => {
    setUrun(yeniUrun);
    setAmbalajBoyutu(FERTIGASYON_VARSAYILAN_AMBALAJ[yeniUrun]);
  };

  return (
    <form action={createFertigasyonKaydiAction.bind(null, parcelId)} className="flex flex-col gap-4">
      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Tarih</div>
        <input
          name="tarih"
          type="date"
          required
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ürün</div>
        <select
          name="urun"
          value={urun}
          onChange={(e) => urunDegistir(e.target.value as FertigasyonUrun)}
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary bg-white"
        >
          {URUNLER.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Vana / Blok Adı (opsiyonel)</div>
        <input
          name="vanaAdi"
          type="text"
          placeholder="Örn. nar yeri"
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Su Tonajı (opsiyonel)</div>
          <input
            name="suTonaji"
            type="number"
            step="0.01"
            min={0}
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ağaç Sayısı</div>
          <input
            name="agacSayisi"
            type="number"
            step="1"
            min={0}
            required
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Verilen Gübre ({birim.doz})</div>
          <input
            name="dozAgac"
            type="number"
            step="0.01"
            min={0}
            required
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">
            {birim.ambalajAdi === "çuval" ? "Çuval Boyutu (kg)" : "Bidon Boyutu (litre)"}
          </div>
          <input
            name="ambalajBoyutu"
            type="number"
            step="0.1"
            min={0.1}
            required
            value={ambalajBoyutu}
            onChange={(e) => setAmbalajBoyutu(Number(e.target.value))}
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Not (opsiyonel)</div>
        <textarea
          name="not"
          rows={2}
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary resize-none"
        />
      </label>

      <button type="submit" className="mt-1 px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
        Hesapla ve Kaydet
      </button>
    </form>
  );
}
