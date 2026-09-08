"use client";

import { useState } from "react";
import Link from "next/link";
import { ParcelBoundaryPicker } from "@/components/map/ParcelBoundaryPicker";
import { OneriliMetin } from "@/components/OneriliMetin";
import { CokluSecimEkle } from "@/components/CokluSecimEkle";
import { agacAraligiHesapla, type ParselOnerileri } from "@/lib/parsel";
import { Button } from "@/components/ui/button/Button";
import type { LatLng, SulamaKuyusu } from "@/types";

// Parsel oluşturma önce harita üzerinde sınır çizmeyi, sonra ad/ürün gibi
// detayları girmeyi ister — mühendis sahada zaten haritaya bakarak parseli
// tarif ediyor, alan (dönüm) da çizilen sınırdan otomatik hesaplanabiliyor.
export function ParselEkleWizard({
  customerId,
  customerAd,
  kuyular,
  oneriler,
  action,
}: {
  customerId: string;
  customerAd: string;
  kuyular: SulamaKuyusu[];
  oneriler: ParselOnerileri;
  action: (formData: FormData) => void;
}) {
  const [adim, setAdim] = useState<"harita" | "form">("harita");
  const [sinir, setSinir] = useState<LatLng[] | null>(null);
  const [alanDonum, setAlanDonum] = useState(0);
  const [agacSayisi, setAgacSayisi] = useState<number | undefined>(undefined);
  const aralik = agacSayisi ? agacAraligiHesapla(alanDonum, agacSayisi) : null;

  if (adim === "harita") {
    return (
      <div className="flex flex-col h-full">
        <div className="px-8 lg:px-10 pt-8 lg:pt-10 pb-5">
          <div className="text-[12.5px] text-text-muted mb-2">{customerAd}</div>
          <div className="text-[21px] font-extrabold">Parsel Ekle</div>
          <div className="text-[12.5px] text-text-secondary mt-1">Önce parselin sınırını haritada çiz.</div>
        </div>
        <div className="flex-1 relative overflow-hidden border-t border-border">
          <ParcelBoundaryPicker
            initialSinir={sinir ?? undefined}
            onDevamEt={(cizilenSinir, hesaplananAlan) => {
              setSinir(cizilenSinir);
              setAlanDonum(hesaplananAlan);
              setAdim("form");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[560px]">
        <div className="text-[12.5px] text-text-muted mb-2">{customerAd}</div>
        <div className="text-[21px] font-extrabold mb-6">Parsel Ekle</div>

        <form action={action} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
          <input type="hidden" name="sinir" value={sinir ? JSON.stringify(sinir) : ""} />

          <div className="flex items-center justify-between bg-primary-bg rounded-[9px] px-3.5 py-2.5">
            <span className="text-[12.5px] font-semibold text-primary">Sınır çizildi · {alanDonum} dönüm</span>
            <button type="button" onClick={() => setAdim("harita")} className="text-[12px] font-bold text-primary underline">
              Sınırı Düzenle
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Parsel Bölgesi (opsiyonel)</div>
              <OneriliMetin name="bolge" placeholder="Örn. Alihocalı Mevkii" oneriler={oneriler.bolge} />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Parsel Adı</div>
              <OneriliMetin name="ad" placeholder="Örn. Kuzey Tarla" oneriler={oneriler.ad} required />
            </label>
          </div>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Dikili Ürün (Çeşit)</div>
            <CokluSecimEkle name="cesitler" oneriler={oneriler.cesit} placeholder="Örn. Valencia Portakal" />
          </label>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Anaç (opsiyonel)</div>
            <CokluSecimEkle name="anaclar" oneriler={oneriler.anac} placeholder="Örn. Volkameriana" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Alan (dönüm)</div>
              <input
                name="alanDonum"
                type="number"
                step="0.1"
                required
                defaultValue={alanDonum}
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
              <OneriliMetin name="sulamaSekli" placeholder="Örn. Damla" oneriler={oneriler.sulamaSekli} />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sulama Şekli Detayı (opsiyonel)</div>
              <input
                name="sulamaSekliDetay"
                placeholder="Örn. 4 lt/sa damlatıcı, 1m aralıklı"
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sulama Kuyusu / Vana Grubu (opsiyonel)</div>
            <select
              name="sulamaKuyusuId"
              defaultValue=""
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
            >
              <option value="">Belirtilmemiş</option>
              {kuyular.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad}
                </option>
              ))}
            </select>
            <div className="text-[11.5px] text-text-muted mt-1.5">
              Aynı kuyudan sulanan parselleri aynı kuyuya atarsan Sulama Raporu&apos;nda birlikte gruplanır.{" "}
              <Link href={`/musteriler/${customerId}/sulama-kuyulari`} className="text-primary font-semibold">
                Yeni kuyu ekle
              </Link>
            </div>
          </label>

          <div className="flex justify-end pt-2">
            <Button type="submit">Parseli Ekle</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
