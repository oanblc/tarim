"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createHaftalikRaporAction, type HaftalikRaporState } from "@/lib/actions";
import { FENOLOJIK_DONEM_LISTESI } from "@/lib/tarim";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import type { Customer, Parcel } from "@/types";

const initialState: HaftalikRaporState = null;

interface ParselKaydi {
  id: string;
  parcelId: string;
  tarih: string;
  donemBitis?: string;
  typeAd: string;
  values: Record<string, string | number>;
  not?: string;
  fenolojikDonem?: string;
  durum?: string;
}

const DURUM_SECENEKLERI = [
  { value: "", label: "Seçilmedi" },
  { value: "planlandi", label: "Planlandı" },
  { value: "devam_ediyor", label: "Devam Ediyor" },
  { value: "takip_ediliyor", label: "Takip Ediliyor" },
  { value: "bekliyor", label: "Bekliyor" },
  { value: "kritik", label: "Kritik Risk / Gecikme" },
  { value: "acil", label: "Acil" },
  { value: "toplanti_gerekli", label: "Toplantı Gerekli" },
  { value: "tamamlandi", label: "Tamamlandı" },
];

// Seçilen günün ait olduğu haftanın Pazartesi/Pazar tarihlerini döner.
function haftaAraligi(gunStr: string): { baslangic: string; bitis: string } {
  const gun = new Date(gunStr + "T00:00:00Z");
  const haftaGunu = gun.getUTCDay() || 7; // Pazartesi=1 ... Pazar=7
  const pazartesi = new Date(gun);
  pazartesi.setUTCDate(gun.getUTCDate() - (haftaGunu - 1));
  const pazar = new Date(pazartesi);
  pazar.setUTCDate(pazartesi.getUTCDate() + 6);
  return { baslangic: pazartesi.toISOString().slice(0, 10), bitis: pazar.toISOString().slice(0, 10) };
}

function gunEkle(gunStr: string, adet: number): string {
  const gun = new Date(gunStr + "T00:00:00Z");
  gun.setUTCDate(gun.getUTCDate() + adet);
  return gun.toISOString().slice(0, 10);
}

export function HaftalikRaporForm({
  musteriler,
  secilenMusteriId,
  parseller,
  kayitlar,
}: {
  musteriler: Customer[];
  secilenMusteriId: string;
  parseller: Parcel[];
  kayitlar: ParselKaydi[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createHaftalikRaporAction, initialState);

  const bugun = new Date().toISOString().slice(0, 10);
  const [seciliGun, setSeciliGun] = useState(bugun);
  const [baslangic, setBaslangic] = useState(() => haftaAraligi(bugun).baslangic);
  const [bitis, setBitis] = useState(() => haftaAraligi(bugun).bitis);

  const [secilenParselIds, setSecilenParselIds] = useState<Set<string>>(new Set());
  const [aciklama, setAciklama] = useState("");
  const [recete, setRecete] = useState("");
  const [gubreleme, setGubreleme] = useState("");
  const [yaprakGubresi, setYaprakGubresi] = useState("");
  const [fenolojikDonem, setFenolojikDonem] = useState("");
  const [durum, setDurum] = useState("");

  const gunSec = (gunStr: string) => {
    setSeciliGun(gunStr);
    const aralik = haftaAraligi(gunStr);
    setBaslangic(aralik.baslangic);
    setBitis(aralik.bitis);
  };

  const parselCikar = (parcelId: string) => {
    setSecilenParselIds((onceki) => {
      const yeni = new Set(onceki);
      yeni.delete(parcelId);
      return yeni;
    });
  };

  // Seçili GÜNE denk gelen kayıtları parsele göre bulur — hafta değil, tam
  // olarak o gün için zaten veri girilmiş parselleri renklendirip doğrudan
  // içeriğini forma doldurabilmek için (her tarih ayrı değerlendirilir).
  const parselKayitlari = (parcelId: string) =>
    kayitlar
      .filter((k) => k.parcelId === parcelId && k.tarih <= seciliGun && (k.donemBitis ?? k.tarih) >= seciliGun)
      .sort((a, b) => b.tarih.localeCompare(a.tarih));

  // Bir parseldeki mevcut kaydı forma doldurur ve SADECE o parseli seçili
  // hale getirir (diğer seçimleri temizler) — aynı anda iki farklı parselin
  // birbirinden bağımsız verisi tek forma karışıp biri diğerinin üzerine
  // yazılmasın diye düzenleme her zaman tek parsel bazında yapılır.
  const kayitlariDoldur = (parcelId: string) => {
    const eslesenler = parselKayitlari(parcelId);
    if (eslesenler.length === 0) return;
    const ilacKaydi = eslesenler.find((k) => k.typeAd === "İlaçlama");
    const gubreKaydi = eslesenler.find((k) => k.typeAd === "Gübreleme");
    const yaprakGubresiKaydi = eslesenler.find((k) => k.typeAd === "Yaprak Gübresi");
    const anaKayit = eslesenler[0];

    setRecete((ilacKaydi?.values?.recete as string) ?? "");
    setGubreleme((gubreKaydi?.values?.detay as string) ?? "");
    setYaprakGubresi((yaprakGubresiKaydi?.values?.detay as string) ?? "");
    setAciklama(anaKayit.not ?? "");
    setFenolojikDonem(anaKayit.fenolojikDonem ?? "");
    setDurum(anaKayit.durum ?? "");
    setSecilenParselIds(new Set([parcelId]));
  };

  return (
    <form action={formAction} className="bg-white border border-border rounded-2xl p-7">
      <input type="hidden" name="seciliGun" value={seciliGun} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
        <div className="flex flex-col gap-4">
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Gün Seç (o günün haftası alınır)</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => gunSec(gunEkle(seciliGun, -7))}
                className="w-9 h-9 shrink-0 rounded-[9px] border border-border flex items-center justify-center hover:border-primary hover:text-primary"
              >
                <ChevronLeftIcon size={14} />
              </button>
              <input
                type="date"
                value={seciliGun}
                onChange={(e) => gunSec(e.target.value)}
                className="flex-1 border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => gunSec(gunEkle(seciliGun, 7))}
                className="w-9 h-9 shrink-0 rounded-[9px] border border-border flex items-center justify-center hover:border-primary hover:text-primary"
              >
                <ChevronRightIcon size={14} />
              </button>
            </div>
            <div className="text-[11.5px] text-text-muted mt-1.5">
              Hafta: {new Date(baslangic).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} –{" "}
              {new Date(bitis).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Başlangıç Tarihi</div>
              <input
                name="baslangicTarihi"
                type="date"
                required
                value={baslangic}
                onChange={(e) => setBaslangic(e.target.value)}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Bitiş Tarihi</div>
              <input
                name="bitisTarihi"
                type="date"
                value={bitis}
                onChange={(e) => setBitis(e.target.value)}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Müşteri</div>
            <select
              defaultValue={secilenMusteriId}
              onChange={(e) => router.push(`/raporlar/haftalik-rapor?musteriId=${e.target.value}`)}
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[12.5px] font-bold text-[#4A4F45]">Parsel(ler)</div>
              {parseller.length > 1 && (
                <div className="flex items-center gap-3 text-[12px] font-bold">
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setSecilenParselIds(new Set(parseller.map((p) => p.id)))}
                  >
                    Tümünü Seç
                  </button>
                  <span className="text-border">·</span>
                  <button
                    type="button"
                    className="text-text-secondary hover:underline"
                    onClick={() => setSecilenParselIds(new Set())}
                  >
                    Temizle
                  </button>
                </div>
              )}
            </div>
            {secilenMusteriId === "" ? (
              <div className="text-[13px] text-text-muted border border-dashed border-border rounded-[9px] px-3.5 py-2.5">
                Önce müşteri seçin
              </div>
            ) : parseller.length === 0 ? (
              <div className="text-[13px] text-text-muted border border-dashed border-border rounded-[9px] px-3.5 py-2.5">
                Bu müşteriye ait parsel yok
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[210px] overflow-y-auto pr-1">
                {parseller.map((p) => {
                  const eslesenler = parselKayitlari(p.id);
                  const veriVar = eslesenler.length > 0;
                  const secili = secilenParselIds.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`rounded-[9px] border px-3 py-2.5 ${
                        veriVar
                          ? "bg-amber-bg border-amber"
                          : secili
                            ? "bg-primary-bg border-primary"
                            : "bg-cream border-border"
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="parcelIds"
                          value={p.id}
                          checked={secili}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              parselCikar(p.id);
                            } else if (veriVar) {
                              kayitlariDoldur(p.id);
                            } else {
                              setSecilenParselIds((onceki) => new Set(onceki).add(p.id));
                            }
                          }}
                          className="peer sr-only"
                        />
                        <span
                          className={`w-[16px] h-[16px] rounded-[5px] border border-border flex items-center justify-center shrink-0 ${
                            secili ? "bg-primary border-primary" : "bg-white"
                          }`}
                        >
                          <CheckIcon size={10} className="text-cream" />
                        </span>
                        <span className="text-[12.5px] font-semibold truncate flex-1">{p.ad}</span>
                      </label>
                      {veriVar && (
                        <div className="flex justify-end mt-1.5 pl-[24px]">
                          <button
                            type="button"
                            onClick={() => kayitlariDoldur(p.id)}
                            className="shrink-0 px-2 py-1 rounded-[6px] bg-amber text-cream text-[10.5px] font-bold hover:opacity-90"
                          >
                            Düzenle
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <input type="hidden" name="customerId" value={secilenMusteriId} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Açıklama / Gözlem</div>
            <textarea
              name="aciklama"
              rows={3}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Bu ziyarette görülenler, yapılan işlemler..."
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary resize-none"
            />
          </label>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">İlaç Reçetesi (opsiyonel)</div>
            <textarea
              name="recete"
              rows={2}
              value={recete}
              onChange={(e) => setRecete(e.target.value)}
              placeholder="Örn. %65 Malathion 1lt + Abamectin 1lt / 1 ton suya"
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary resize-none"
            />
          </label>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Gübreleme (opsiyonel)</div>
            <textarea
              name="gubreleme"
              rows={2}
              value={gubreleme}
              onChange={(e) => setGubreleme(e.target.value)}
              placeholder="Uygulanan gübre türü, dozu, yöntemi..."
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary resize-none"
            />
          </label>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Yaprak Gübresi (opsiyonel)</div>
            <textarea
              name="yaprakGubresi"
              rows={2}
              value={yaprakGubresi}
              onChange={(e) => setYaprakGubresi(e.target.value)}
              placeholder="Örn. Mc Cream 3lt + Plantafol 20.20.20 4kg + Brexil Multi 2kg / 1 ton suya"
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Fenolojik Dönem</div>
              <select
                name="fenolojikDonem"
                value={fenolojikDonem}
                onChange={(e) => setFenolojikDonem(e.target.value)}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
              >
                <option value="">Seçilmedi</option>
                {FENOLOJIK_DONEM_LISTESI.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Durum</div>
              <select
                name="durum"
                value={durum}
                onChange={(e) => setDurum(e.target.value)}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
              >
                {DURUM_SECENEKLERI.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="text-[12.5px] text-red bg-red-bg rounded-[9px] px-3.5 py-2.5 mt-5">{state.error}</div>
      )}

      <div className="flex justify-end pt-5 mt-5 border-t border-border-soft">
        <button
          type="submit"
          disabled={pending || !secilenMusteriId}
          className="px-6 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold disabled:opacity-60"
        >
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
