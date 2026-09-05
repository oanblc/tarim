"use client";

import { useState } from "react";
import { InfoIcon } from "@/components/icons";

export function FertigasyonHesaplamaButonu() {
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
            className="bg-white rounded-2xl max-w-[600px] w-full max-h-[85vh] overflow-y-auto p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-[17px] font-extrabold">Fertigasyon Dozlama Nasıl Hesaplanıyor?</div>
              <button
                type="button"
                onClick={() => setAcik(false)}
                className="text-text-muted hover:text-text text-[20px] leading-none px-1"
              >
                ×
              </button>
            </div>
            <div className="text-[12.5px] text-text-secondary mb-5">
              Gerçek mühendis dosyasındaki (naryeri) &quot;... correct&quot; sayfalarının formül karşılığıdır — vana
              bazlı damlama gübrelemesinde kaç çuval/bidon hazırlanacağını hesaplar.
            </div>

            <div className="flex flex-col gap-5 text-[13px] text-[#3A3F36] leading-relaxed">
              <div>
                <div className="font-bold text-[13.5px] mb-1">1. Girdiler</div>
                <p>
                  Bir sulama turunda, tek bir vana/blok için: <b>Ağaç Sayısı</b> ve o ağaçlara verilecek{" "}
                  <b>doz</b> (AS21, K2SO4, Demir için gram/ağaç; H3PO4 için cc/ağaç). Bu doz mühendisin yaprak/toprak
                  analizine göre belirlediği bir karardır — sistem tarafından hesaplanmaz, siz girersiniz.
                </p>
              </div>

              <div>
                <div className="font-bold text-[13.5px] mb-1">2. Toplam ihtiyaç</div>
                <div className="bg-cream rounded-[9px] px-3.5 py-2.5 my-2 font-mono text-[12px]">
                  Toplam (kg veya litre) = Doz (g veya cc / ağaç) × Ağaç Sayısı ÷ 1000
                </div>
              </div>

              <div>
                <div className="font-bold text-[13.5px] mb-1">3. Çuval / Bidon sayısı</div>
                <p>
                  Toplam ihtiyaç, girdiğiniz ambalaj boyutuna bölünerek kaç çuval (kg&apos;lık ürünler) veya kaç bidon
                  (litre&apos;lik H3PO4) hazırlamanız gerektiğini verir:
                </p>
                <div className="bg-cream rounded-[9px] px-3.5 py-2.5 my-2 font-mono text-[12px]">
                  Çuval/Bidon Sayısı = Toplam İhtiyaç ÷ Ambalaj Boyutu
                </div>
                <p className="text-text-muted">
                  Excel&apos;deki varsayılan ambalaj boyutları — AS21: 50 kg/çuval, K2SO4: 25 kg/çuval, H3PO4: 20
                  litre/bidon, Demir: 5 kg/çuval — form açıldığında otomatik önerilir, isterseniz değiştirebilirsiniz.
                </p>
              </div>

              <div>
                <div className="font-bold text-[13.5px] mb-1">4. Aynı gün / ürün için birden fazla vana</div>
                <p>
                  Aynı tarihte aynı ürünü birden fazla vanaya uyguladıysanız, her vana için ayrı bir kayıt girin —
                  liste altındaki toplam satırı, o gün/ürün için tüm vanaların toplamını (Excel&apos;deki SUM
                  satırının karşılığı) otomatik gösterir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
