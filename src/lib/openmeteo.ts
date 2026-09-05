// Open-Meteo entegrasyonu: Isı Toplamı (GDD) haftalarını elle girmek yerine
// parselin konumuna göre otomatik doldurmak için. API anahtarı gerekmez.
// - Geçmiş tarihler: archive-api.open-meteo.com (ERA5 reanalysis, ~5 gün gecikmeli)
// - Yakın geçmiş/gelecek tarihler: api.open-meteo.com/forecast (past_days/forecast_days destekli)

export interface HaftalikSicaklikSonucu {
  ortSicaklik: number;
  minSicaklik: number;
  maksSicaklik: number;
}

function isoEkle(iso: string, gun: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + gun);
  return d.toISOString().slice(0, 10);
}

export async function haftalikSicaklikGetir(
  lat: number,
  lng: number,
  haftaBaslangic: string,
): Promise<HaftalikSicaklikSonucu | null> {
  const haftaBitis = isoEkle(haftaBaslangic, 6);
  const bugun = new Date().toISOString().slice(0, 10);
  // Arşiv API'si ~5 gün gecikmeli veri sunuyor; güvenli pay için 7 gün geriden
  // eski sayıp ona göre hangi uç noktayı kullanacağımıza karar veriyoruz.
  const arsivSiniri = isoEkle(bugun, -7);
  const gecmisTeUcNokta = haftaBitis <= arsivSiniri;

  const baseUrl = gecmisTeUcNokta
    ? "https://archive-api.open-meteo.com/v1/archive"
    : "https://api.open-meteo.com/v1/forecast";

  const url =
    `${baseUrl}?latitude=${lat}&longitude=${lng}` +
    `&start_date=${haftaBaslangic}&end_date=${haftaBitis}` +
    `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as {
    daily?: { temperature_2m_mean?: number[]; temperature_2m_min?: number[]; temperature_2m_max?: number[] };
  };
  const ortalamalar = data.daily?.temperature_2m_mean;
  const minler = data.daily?.temperature_2m_min;
  const makslar = data.daily?.temperature_2m_max;
  if (!ortalamalar || !minler || !makslar || ortalamalar.length === 0) return null;

  const yuvarla = (n: number) => Math.round(n * 10) / 10;
  const ortalama = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    ortSicaklik: yuvarla(ortalama(ortalamalar)),
    minSicaklik: yuvarla(Math.min(...minler)),
    maksSicaklik: yuvarla(Math.max(...makslar)),
  };
}

export interface GunlukIklimSonucu {
  tarih: string;
  ortSicaklik: number;
  minSicaklik: number;
  maksSicaklik: number;
  yagis: number;
}

async function gunlukAraligiCek(
  baseUrl: string,
  lat: number,
  lng: number,
  baslangic: string,
  bitis: string,
): Promise<GunlukIklimSonucu[]> {
  if (baslangic > bitis) return [];
  const url =
    `${baseUrl}?latitude=${lat}&longitude=${lng}` +
    `&start_date=${baslangic}&end_date=${bitis}` +
    `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = (await res.json()) as {
    daily?: {
      time?: string[];
      temperature_2m_mean?: number[];
      temperature_2m_min?: number[];
      temperature_2m_max?: number[];
      precipitation_sum?: number[];
    };
  };
  const gunler = data.daily?.time;
  const ortalamalar = data.daily?.temperature_2m_mean;
  const minler = data.daily?.temperature_2m_min;
  const makslar = data.daily?.temperature_2m_max;
  const yagislar = data.daily?.precipitation_sum;
  if (!gunler || !ortalamalar || !minler || !makslar) return [];

  const yuvarla = (n: number) => Math.round(n * 10) / 10;
  return gunler.map((tarih, i) => ({
    tarih,
    ortSicaklik: yuvarla(ortalamalar[i]),
    minSicaklik: yuvarla(minler[i]),
    maksSicaklik: yuvarla(makslar[i]),
    yagis: yuvarla(yagislar?.[i] ?? 0),
  }));
}

// Verilen tarih aralığındaki her gün için ayrı sıcaklık/yağış kaydı döner.
// Aralık, arşivin gecikme sınırını (~7 gün) aşan kısım için archive-api'yi,
// güncel kısım için forecast-api'yi kullanır — gerekirse ikisini birleştirir.
export async function gunlukSicaklikSerisiGetir(
  lat: number,
  lng: number,
  baslangic: string,
  bitis: string,
): Promise<GunlukIklimSonucu[]> {
  const bugun = new Date().toISOString().slice(0, 10);
  const arsivSiniri = isoEkle(bugun, -7);

  if (bitis <= arsivSiniri) {
    return gunlukAraligiCek("https://archive-api.open-meteo.com/v1/archive", lat, lng, baslangic, bitis);
  }
  if (baslangic > arsivSiniri) {
    return gunlukAraligiCek("https://api.open-meteo.com/v1/forecast", lat, lng, baslangic, bitis);
  }

  const [gecmis, guncel] = await Promise.all([
    gunlukAraligiCek("https://archive-api.open-meteo.com/v1/archive", lat, lng, baslangic, arsivSiniri),
    gunlukAraligiCek("https://api.open-meteo.com/v1/forecast", lat, lng, isoEkle(arsivSiniri, 1), bitis),
  ]);
  return [...gecmis, ...guncel];
}
