"use client";

import { useState } from "react";
import { InfoIcon } from "@/components/icons";

export function HesaplamaMantigiButonu() {
  const [acik, setAcik] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="flex items-center gap-1.5 text-[12.5px] font-bold text-primary hover:underline shrink-0"
      >
        <InfoIcon size={14} className="text-primary" />
        Nasıl hesaplanıyor?
      </button>

      {acik && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
          onClick={() => setAcik(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-[640px] w-full max-h-[85vh] overflow-y-auto p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-[17px] font-extrabold">Beslenme Programı Nasıl Hesaplanıyor?</div>
              <button
                type="button"
                onClick={() => setAcik(false)}
                className="text-text-muted hover:text-text text-[20px] leading-none px-1"
              >
                ×
              </button>
            </div>
            <div className="text-[12.5px] text-text-secondary mb-5">
              Formül zinciri, gerçek mühendis dosyasındaki (CALISMA / öneri / data map sayfaları) hesap mantığının
              birebir karşılığıdır — gerçek hücre değerleriyle doğrulanmıştır.
            </div>

            <div className="flex flex-col gap-5 text-[13px] text-[#3A3F36] leading-relaxed">
              <div>
                <div className="font-bold text-[13.5px] mb-1">1. Girdiler</div>
                <p>
                  Sizin girdiğiniz dört değer hesabın başlangıç noktasıdır: <b>Hedef Azot</b> (kg saf azot / ha / yıl),
                  hedeflediğiniz <b>N:P:K oranı</b>, <b>Ağaç Sayısı / ha</b> ve parselin <b>alanı</b> (dönüm).
                </p>
              </div>

              <div>
                <div className="font-bold text-[13.5px] mb-1">2. AS21 (Amonyum Sülfat) toplam dozu</div>
                <p>
                  Amonyum sülfatın azot oranı %21&apos;dir. Ağaç başına, sezon boyunca verilecek toplam AS21 miktarı:
                </p>
                <div className="bg-cream rounded-[9px] px-3.5 py-2.5 my-2 font-mono text-[12px]">
                  AS21 (g/ağaç) = Hedef Azot ÷ 0,21 ÷ Ağaç Sayısı/ha × 1000
                </div>
                <p>Bu toplam, sezona üç döneme yayılır: <b>%60</b> Şubat Başı–Mart Ortası, <b>%36</b> Mayıs Ortası–Sonu, <b>%4</b> Temmuz Başı.</p>
              </div>

              <div>
                <div className="font-bold text-[13.5px] mb-1">3. Fosfor (H3PO4 / MAP)</div>
                <p>
                  Hedeflediğiniz P oranına göre, AS21 toplamının <b>%47,7&apos;si</b> fosfor ihtiyacını (H3PO4 cinsinden)
                  verir. Bu miktar üç zamana bölünür: <b>%35 / %32,5 / %32,5</b>. İlk iki dilim granül gübre olan
                  <b> MAP</b>&apos;e çevrilir (H3PO4 × 1,64), üçüncü dilim ise Ağustos Ortası&apos;nda sıvı H3PO4 olarak
                  uygulanır.
                </p>
                <p className="mt-1.5 text-text-muted">
                  MAP de azot içerdiğinden, MAP uygulanan dönemlerde AS21 dozunun bir kısmı (MAP miktarının %12&apos;si)
                  düşülerek toplam azot dengesi korunur.
                </p>
              </div>

              <div>
                <div className="font-bold text-[13.5px] mb-1">4. Potasyum (K2SO4)</div>
                <p>
                  Hedeflediğiniz K oranına göre, AS21 toplamının <b>%48,7&apos;si</b> potasyum ihtiyacını (K2SO4 cinsinden)
                  verir. Bu miktar dört zamana bölünür: <b>%22 / %41 / %24,5 / %12,5</b> (Şubat–Mart, Mayıs, Temmuz,
                  Ağustos Sonu).
                </p>
              </div>

              <div>
                <div className="font-bold text-[13.5px] mb-1">5. Parsel toplamı</div>
                <p>
                  Yukarıdaki dozlar &quot;ağaç başına&quot; hesaplanır. Parselin toplam ihtiyacını bulmak için:
                </p>
                <div className="bg-cream rounded-[9px] px-3.5 py-2.5 my-2 font-mono text-[12px]">
                  Parsel Toplamı (kg) = Doz (g/ağaç) × Toplam Ağaç Sayısı ÷ 1000
                </div>
                <p>
                  Toplam ağaç sayısı da alan (dönüm ÷ 10 = ha) ile girdiğiniz &quot;Ağaç Sayısı / ha&quot; değerinin çarpımından
                  gelir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
