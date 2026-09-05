// Günlük ısı/iklim verisinin çekilip kaydedilmesi — hem elle tetiklenen
// "Son N Günü Çek" aksiyonu hem de günlük worker (bkz. src/app/api/cron/gunluk-isi)
// tarafından paylaşılan tek bir yer.

import { customers, parcels, isiGunlukleri } from "./repositories";
import { polygonCentroid } from "./geo";
import { gunlukSicaklikSerisiGetir } from "./openmeteo";

function gunEkle(iso: string, gun: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + gun);
  return d.toISOString().slice(0, 10);
}

export async function gunlukIsiGuncelle(
  customerId: string,
  gunSayisi: number,
): Promise<{ ok: true; islenenGun: number } | { ok: false; error: string }> {
  const musteriParselleri = (await parcels.list()).filter((p) => p.customerId === customerId && p.konum);
  if (musteriParselleri.length === 0) {
    return { ok: false, error: "Bu müşterinin konumu tanımlı hiçbir parseli yok — önce parsele konum işaretle." };
  }

  const merkez = polygonCentroid(musteriParselleri.map((p) => p.konum!));
  const bugun = new Date().toISOString().slice(0, 10);
  const baslangic = gunEkle(bugun, -(gunSayisi - 1));

  const seri = await gunlukSicaklikSerisiGetir(merkez.lat, merkez.lng, baslangic, bugun);
  if (seri.length === 0) {
    return { ok: false, error: "Hava durumu servisinden veri alınamadı." };
  }

  const mevcutKayitlar = await isiGunlukleri.listByCustomer(customerId);
  for (const gun of seri) {
    const mevcut = mevcutKayitlar.find((k) => k.tarih === gun.tarih);
    if (mevcut) {
      await isiGunlukleri.update(mevcut.id, gun);
    } else {
      await isiGunlukleri.create({ customerId, ...gun });
    }
  }

  return { ok: true, islenenGun: seri.length };
}

// Konumu tanımlı parseli olan tüm müşteriler için günlük veriyi günceller —
// worker'ın (cron) her çağrısında kullanılır. Son birkaç günü tekrar çekmek
// (varsayılan 3) arşiv verisinin geriye dönük düzeltilmesini de yakalar.
export async function tumMusterilerIcinGunlukIsiGuncelle(gunSayisi = 3) {
  const allCustomers = await customers.list();
  const allParcels = await parcels.list();
  const sonuclar: { customerId: string; ok: boolean; detay: string }[] = [];

  for (const customer of allCustomers) {
    const konumluVarMi = allParcels.some((p) => p.customerId === customer.id && p.konum);
    if (!konumluVarMi) continue;
    const sonuc = await gunlukIsiGuncelle(customer.id, gunSayisi);
    sonuclar.push({
      customerId: customer.id,
      ok: sonuc.ok,
      detay: sonuc.ok ? `${sonuc.islenenGun} gün güncellendi` : sonuc.error,
    });
  }

  return sonuclar;
}
