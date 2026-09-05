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
