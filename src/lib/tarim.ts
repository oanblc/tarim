// Excel dosyalarından (Yarbaşı_sulama_programı, Fasulye Isı Toplamı) formül
// seviyesinde çıkarılıp doğrulanmış agronomik hesaplamalar.

// arıkoğlu çiftlik Haftalık Rapor.xlsx — "çalışma" sayfasının Fenolojik Dönem
// sütununa atanmış gerçek Excel açılır listesi (Veri Doğrulama →
// FenolojikDonemler tablosu). Narenciye fenolojik gelişim evreleri.
export const FENOLOJIK_DONEM_LISTESI = [
  "Kış Dinlenmesi",
  "Uyanma",
  "Tomurcuklanma",
  "%25 Çiçeklenme",
  "%50 Çiçeklenme",
  "%80 Çiçeklenme",
  "Petallerin Dökülmesi",
  "Meyve Tutumu",
  "Hücre Bölünmesi Dönemi",
  "Haziran Dökümü",
  "Hücre Genişlemesi",
  "Renk Dönüşümü",
  "Olgunlaşma",
  "Hasat",
  "Hasat Sonrası",
];

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface SulamaGunSonucu {
  tarih: string;
  puan: 0 | 0.8 | 1;
}

export interface SulamaUyumSonucu {
  gunler: SulamaGunSonucu[];
  planlananGunSayisi: number;
  tamGunSayisi: number;
  yakinGunSayisi: number; // ±1 gün toleransıyla eşleşen
  kacirilanGunSayisi: number;
  skor: number | null; // 10 üzerinden
  not: string;
}

// Excel formülü (Yarbaşı_sulama_programı.xlsx, "Sulama Uyumu" sayfası):
//   IF(plan_günü_var, IF(tam_o_gün_sulanmış,1, IF(±1_gün_içinde_sulanmış,0.8,0)), "")
//   puan = ROUND(10 * TOPLAM(gün puanları) / TOPLAM(planlanan gün), 1)
export function sulamaUyumuHesapla(planlananTarihler: string[], uygulananTarihler: string[]): SulamaUyumSonucu {
  const uygulanan = new Set(uygulananTarihler);

  const gunler: SulamaGunSonucu[] = planlananTarihler.map((tarih) => {
    if (uygulanan.has(tarih)) return { tarih, puan: 1 };
    const onceki = addDaysIso(tarih, -1);
    const sonraki = addDaysIso(tarih, 1);
    if (uygulanan.has(onceki) || uygulanan.has(sonraki)) return { tarih, puan: 0.8 };
    return { tarih, puan: 0 };
  });

  const planlananGunSayisi = gunler.length;
  const tamGunSayisi = gunler.filter((g) => g.puan === 1).length;
  const yakinGunSayisi = gunler.filter((g) => g.puan === 0.8).length;
  const kacirilanGunSayisi = gunler.filter((g) => g.puan === 0).length;
  const toplamPuan = gunler.reduce((s, g) => s + g.puan, 0);

  const skor = planlananGunSayisi === 0 ? null : Math.round(((10 * toplamPuan) / planlananGunSayisi) * 10) / 10;

  let not: string;
  if (planlananGunSayisi === 0) not = "Plan yok";
  else if (planlananGunSayisi < 3) not = "Az plan günü — puan temsili değil";
  else if (kacirilanGunSayisi > 0) not = `${kacirilanGunSayisi} gün kaçırılmış`;
  else not = "Tüm planlanan günler uygulanmış";

  return { gunler, planlananGunSayisi, tamGunSayisi, yakinGunSayisi, kacirilanGunSayisi, skor, not };
}

export const GDD_BASE_TEMP_VARSAYILAN = 10; // °C — incir/narenciye için Excel'de kullanılan baz sıcaklık

export function haftalikGdd(ortSicaklik: number | undefined, baseTemp = GDD_BASE_TEMP_VARSAYILAN): number | undefined {
  if (ortSicaklik === undefined) return undefined;
  return Math.round(Math.max(0, ortSicaklik - baseTemp) * 7 * 10) / 10;
}

// Excel formülü (Fasulye "Isı Toplamı" sayfası, G sütunu):
//   =IF(H<>"", H, IF(F="", "", SUM($F$ilkSatır:$Fbusatır)))
// Yani: elle "rapordaki kümülatif" girilmişse o gösterilir (gelecek haftaların
// toplamını etkilemez — ham haftalık değerler üzerinden kümülatif hesap devam
// eder), o hafta için haftalık GDD hiç girilmemişse boş kalır.
export function kumulatifGddHesapla(
  haftalar: { haftalikGdd?: number; rapordakiKumulatifGdd?: number }[],
): (number | undefined)[] {
  let running = 0;
  return haftalar.map((h) => {
    if (h.haftalikGdd !== undefined) running = Math.round((running + h.haftalikGdd) * 10) / 10;
    if (h.rapordakiKumulatifGdd !== undefined) return h.rapordakiKumulatifGdd;
    if (h.haftalikGdd === undefined) return undefined;
    return running;
  });
}
