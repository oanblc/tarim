// Günlük ısı/iklim verisinin çekilip kaydedilmesi — hem elle tetiklenen
// "Son N Günü Çek" aksiyonu hem de günlük worker (bkz. src/app/api/cron/gunluk-isi)
// tarafından paylaşılan tek bir yer.

import { parcels, isiGunlukleri } from "./repositories";
import { gunlukSicaklikSerisiGetir } from "./openmeteo";
import type { IsiHaftasi } from "@/types";

function gunEkle(iso: string, gun: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + gun);
  return d.toISOString().slice(0, 10);
}

// Bir tarihin ait olduğu haftanın Pazartesi'sini döner (ISO hafta).
function haftaBaslangiciBul(tarih: string): string {
  const gun = new Date(tarih + "T00:00:00Z");
  const haftaGunu = gun.getUTCDay() || 7; // Pazartesi=1 ... Pazar=7
  gun.setUTCDate(gun.getUTCDate() - (haftaGunu - 1));
  return gun.toISOString().slice(0, 10);
}

// Günlük Isı Günlüğü kayıtlarından haftalık ortalama sıcaklık üretir —
// müşteri elle "Isı Toplamı" haftası tanımlamamışsa Haftalık Özet'in
// otomatik çekilen günlük veriyle de çalışabilmesi için (bkz.
// getHaftalikOzetView, src/lib/queries.ts).
export function gunlukVeridenHaftalarUret(
  gunler: { tarih: string; ortSicaklik?: number; minSicaklik?: number; maksSicaklik?: number; yagis?: number }[],
  customerId: string,
): IsiHaftasi[] {
  const gruplar = new Map<string, typeof gunler>();
  for (const gun of gunler) {
    const baslangic = haftaBaslangiciBul(gun.tarih);
    if (!gruplar.has(baslangic)) gruplar.set(baslangic, []);
    gruplar.get(baslangic)!.push(gun);
  }

  const ortalama = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined);

  return Array.from(gruplar.entries())
    .map(([haftaBaslangic, buHaftakiGunler]) => {
      const sicakliklar = buHaftakiGunler.map((g) => g.ortSicaklik).filter((n): n is number => n !== undefined);
      const yagislar = buHaftakiGunler.map((g) => g.yagis).filter((n): n is number => n !== undefined);
      const ort = ortalama(sicakliklar);
      return {
        id: `gunluk-${customerId}-${haftaBaslangic}`,
        customerId,
        haftaBaslangic,
        ortSicaklik: ort !== undefined ? Math.round(ort * 10) / 10 : undefined,
        yagis: yagislar.length ? Math.round(yagislar.reduce((a, b) => a + b, 0) * 10) / 10 : undefined,
        createdAt: new Date().toISOString(),
      };
    })
    .sort((a, b) => a.haftaBaslangic.localeCompare(b.haftaBaslangic));
}

export async function gunlukIsiGuncelle(
  parcelId: string,
  gunSayisi: number,
): Promise<{ ok: true; islenenGun: number } | { ok: false; error: string }> {
  const parcel = (await parcels.list()).find((p) => p.id === parcelId);
  if (!parcel || !parcel.konum) {
    return { ok: false, error: "Bu parselin konumu tanımlı değil — önce haritada sınırını çiz." };
  }

  const bugun = new Date().toISOString().slice(0, 10);
  const baslangic = gunEkle(bugun, -(gunSayisi - 1));

  const seri = await gunlukSicaklikSerisiGetir(parcel.konum.lat, parcel.konum.lng, baslangic, bugun);
  if (seri.length === 0) {
    return { ok: false, error: "Hava durumu servisinden veri alınamadı." };
  }

  const mevcutKayitlar = await isiGunlukleri.listByParcel(parcelId);
  for (const gun of seri) {
    const mevcut = mevcutKayitlar.find((k) => k.tarih === gun.tarih);
    if (mevcut) {
      await isiGunlukleri.update(mevcut.id, gun);
    } else {
      await isiGunlukleri.create({ customerId: parcel.customerId, parcelId, ...gun });
    }
  }

  return { ok: true, islenenGun: seri.length };
}

// Konumu tanımlı tüm parseller için günlük veriyi günceller — worker'ın
// (cron) her çağrısında kullanılır. Her parsel kendi konumu üzerinden ayrı
// çekilir (aynı müşterinin parselleri farklı mikroklimada olabilir). Son
// birkaç günü tekrar çekmek (varsayılan 3) arşiv verisinin geriye dönük
// düzeltilmesini de yakalar.
export async function tumMusterilerIcinGunlukIsiGuncelle(gunSayisi = 3) {
  const konumluParseller = (await parcels.list()).filter((p) => p.konum);
  const sonuclar: { parcelId: string; customerId: string; ok: boolean; detay: string }[] = [];

  for (const parcel of konumluParseller) {
    const sonuc = await gunlukIsiGuncelle(parcel.id, gunSayisi);
    sonuclar.push({
      parcelId: parcel.id,
      customerId: parcel.customerId,
      ok: sonuc.ok,
      detay: sonuc.ok ? `${sonuc.islenenGun} gün güncellendi` : sonuc.error,
    });
  }

  return sonuclar;
}
