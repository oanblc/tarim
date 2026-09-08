"use client";

import { useState } from "react";
import Link from "next/link";
import { OneriliMetin } from "@/components/OneriliMetin";
import { CokluSecimEkle } from "@/components/CokluSecimEkle";
import { agacAraligiHesapla, parselCesitleri, type ParselOnerileri } from "@/lib/parsel";
import { Button } from "@/components/ui/button/Button";
import type { Parcel, SulamaKuyusu } from "@/types";

export function ParselDuzenleForm({
  parcel,
  customerId,
  kuyular,
  oneriler,
  action,
  silAction,
}: {
  parcel: Parcel;
  customerId?: string;
  kuyular: SulamaKuyusu[];
  oneriler: ParselOnerileri;
  action: (formData: FormData) => void;
  silAction: () => void;
}) {
  const [agacSayisi, setAgacSayisi] = useState<number | undefined>(parcel.agacSayisi);
  const aralik = agacSayisi ? agacAraligiHesapla(parcel.alanDonum, agacSayisi) : null;

  return (
    <>
      <form action={action} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Parsel Bölgesi (opsiyonel)</div>
            <OneriliMetin name="bolge" defaultValue={parcel.bolge} oneriler={oneriler.bolge} />
          </label>
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Parsel Adı</div>
            <OneriliMetin name="ad" defaultValue={parcel.ad} oneriler={oneriler.ad} required />
          </label>
        </div>

        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Dikili Ürün (Çeşit)</div>
          <CokluSecimEkle name="cesitler" baslangic={parselCesitleri(parcel)} oneriler={oneriler.cesit} placeholder="Örn. Valencia Portakal" />
        </label>

        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Anaç (opsiyonel)</div>
          <CokluSecimEkle name="anaclar" baslangic={parcel.anaclar ?? []} oneriler={oneriler.anac} placeholder="Örn. Volkameriana" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Alan (dönüm)</div>
            <input
              name="alanDonum"
              type="number"
              step="0.1"
              required
              defaultValue={parcel.alanDonum}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ağaç Sayısı (opsiyonel)</div>
            <input
              name="agacSayisi"
              type="number"
              step="1"
              min={0}
              defaultValue={parcel.agacSayisi}
              placeholder="Örn. 2800"
              onChange={(e) => setAgacSayisi(Number(e.target.value) || undefined)}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
            {aralik && (
              <div className="text-[11.5px] text-text-muted mt-1.5">
                ≈ {aralik.m2PerAgac} m²/ağaç · yaklaşık {aralik.araligiM} x {aralik.araligiM} m dikim aralığı
              </div>
            )}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sulama Şekli (opsiyonel)</div>
            <OneriliMetin name="sulamaSekli" defaultValue={parcel.sulamaSekli} oneriler={oneriler.sulamaSekli} />
          </label>
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sulama Şekli Detayı (opsiyonel)</div>
            <input
              name="sulamaSekliDetay"
              defaultValue={parcel.sulamaSekliDetay}
              placeholder="Örn. 4 lt/sa damlatıcı, 1m aralıklı"
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sulama Kuyusu / Vana Grubu</div>
          <select
            name="sulamaKuyusuId"
            defaultValue={parcel.sulamaKuyusuId ?? ""}
            className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
          >
            <option value="">Belirtilmemiş</option>
            {kuyular.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ad}
              </option>
            ))}
          </select>
          {customerId && (
            <div className="text-[11.5px] text-text-muted mt-1.5">
              <Link href={`/musteriler/${customerId}/sulama-kuyulari`} className="text-primary font-semibold">
                Kuyuları yönet
              </Link>
            </div>
          )}
        </label>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button href={`/parseller/${parcel.id}`} variant="outline">
            Vazgeç
          </Button>
          <Button type="submit">Kaydet</Button>
        </div>
      </form>

      <div className="bg-white border border-red/30 rounded-2xl p-6 mt-5 flex items-center justify-between">
        <div>
          <div className="text-[13.5px] font-bold text-red">Parseli Sil</div>
          <div className="text-[12px] text-text-secondary mt-0.5">
            Bu parsele bağlı tüm saha kayıtları, görevler, sulama ve beslenme planları da silinir. Geri alınamaz.
          </div>
        </div>
        <form action={silAction}>
          <Button type="submit" variant="danger" className="whitespace-nowrap">Parseli Sil</Button>
        </form>
      </div>
    </>
  );
}
