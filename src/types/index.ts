// Domain modeli. Şimdilik dosya tabanlı (JSON) depoya yazılıyor; alanlar
// ileride MongoDB'ye taşınacak şekilde düz (flat) ve id-referanslı tutuluyor.

export type Role = "admin" | "muhendis";

export interface User {
  id: string;
  ad: string;
  email: string;
  passwordHash: string;
  rol: Role;
  createdAt: string;
}

export interface Customer {
  id: string;
  ad: string;
  telefon?: string;
  email?: string;
  adres?: string;
  sorumluMuhendisId: string;
  createdAt: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Parcel {
  id: string;
  customerId: string;
  ad: string;
  urun: string; // ekili ürün/kültür
  alanDonum: number;
  agacSayisi?: number; // toplam ağaç/fidan sayısı
  ekimDuzeni?: string; // dikim aralığı, örn. "7 x 2,5 m"
  sulamaKuyusuId?: string; // parselin bağlı olduğu SulamaKuyusu (sulama raporu gruplaması için)
  konum?: LatLng; // parselin merkez noktası (harita ortalama/pin için)
  sinir?: LatLng[]; // poligon köşe noktaları, çizilmemişse boş
  createdAt: string;
}

// Bir müşterinin sulama kuyusu/vana grubu — birden fazla parsel aynı kuyudan
// sulanabilir, Sulama Raporu bu gruba göre parselleri bir arada gösterir.
export interface SulamaKuyusu {
  id: string;
  customerId: string;
  ad: string;
  not?: string;
  createdAt: string;
}

// Ayarlar'da tanımlanabilen kayıt tipi (örn. "Gübreleme", "Sulama",
// "Hastalık/Zararlı", "Gözlem", "Yaprak Analizi" ...). Yeni bir tip veya
// yeni bir alan eklemek kod değişikliği gerektirmesin diye şema burada.
export type FieldType = "text" | "number" | "date" | "select" | "textarea";

export interface RecordFieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // type === "select" ise
  required?: boolean;
}

export interface RecordTypeDef {
  id: string;
  ad: string; // "Gübreleme", "Sulama", "Hastalık" ...
  ikon?: string;
  fields: RecordFieldDef[];
}

// Sahada girilen tekil kayıt. `values` alanı RecordTypeDef.fields'a göre
// serbest biçimlidir. `fenolojikDonem` ve `durum` kayıt tipinden bağımsız —
// gerçek mühendis dosyalarında (Veri Girişi/çalışma jurnalleri) her satırda
// tipten bağımsız olarak bulunan iki sütun.
export interface FieldRecord {
  id: string;
  parcelId: string;
  recordTypeId: string;
  tarih: string;
  muhendisId: string;
  values: Record<string, string | number>;
  not?: string;
  fenolojikDonem?: string;
  durum?: string;
  donemBitis?: string; // dolu ise `tarih` dönem başlangıcı, bu da bitişi temsil eder
  createdAt: string;
}

export type ReportTuru = "genel" | "haftalik";

export interface Report {
  id: string;
  customerId: string;
  parcelIds: string[];
  donemBaslangic: string;
  donemBitis: string;
  ozet: string;
  tur: ReportTuru;
  kaynakKayitIds?: string[];
  createdAt: string;
}

// Görev/aksiyon durumu — gerçek mühendis dosyalarında görülen zengin sözlük
// (Excel'deki "Parsel Gezisi" / "data" referans sayfalarından).
export type GorevDurum =
  | "planlandi"
  | "devam_ediyor"
  | "takip_ediliyor"
  | "kritik"
  | "acil"
  | "bekliyor"
  | "tamamlandi";

// Bir saha gözleminden doğan, termin tarihi ve durumu olan aksiyon kalemi.
// FieldRecord'dan farkı: FieldRecord tek seferlik/değişmez bir geçmiş kaydı,
// Gorev ise zaman içinde durumu güncellenen bir iş kalemi.
export interface Gorev {
  id: string;
  parcelId: string;
  konu: string; // "Gübreleme", "Sulama", "Budama", "Yabancı Ot", "Genel" ...
  gozlem: string;
  onerilenUygulama?: string;
  sorumluId?: string;
  terminTarihi?: string;
  durum: GorevDurum;
  tarih: string; // tespit/oluşturulma tarihi
  not?: string;
  createdAt: string;
}

// Haftalık iklim / Isı Toplamı (GDD - Growing Degree Days) kaydı. Farm/müşteri
// bazında tutuluyor (Excel dosyalarında da workbook = tek çiftlik = tek iklim
// serisi idi).
export interface IsiHaftasi {
  id: string;
  customerId: string;
  haftaBaslangic: string;
  ortSicaklik?: number;
  minSicaklik?: number;
  maksSicaklik?: number;
  yagis?: number;
  nem?: number;
  rapordakiKumulatifGdd?: number; // elle girilirse hesaplananın yerine geçer
  not?: string;
  createdAt: string;
}

// Bir parsel için planlanan sulama günleri. Basit tutuluyor: açık tarih
// listesi (tekrarlayan kural yerine) — mühendis "her N günde bir" gibi bir
// kuraldan üretip düzenleyebilir ya da elle girebilir.
export interface SulamaPlani {
  id: string;
  parcelId: string;
  donemBaslangic: string;
  donemBitis: string;
  planlananTarihler: string[]; // ISO tarih (YYYY-MM-DD) listesi
  createdAt: string;
}

// Beslenme (gübreleme) programı: bir parsel için sezonluk hedef azot oranı
// ve hedef N:P:K besin oranından yola çıkarak ürün bazlı doz takvimi
// hesaplanır (bkz. src/lib/beslenme.ts). Gerçek mühendis dosyalarındaki
// (naryeri) CALISMA/öneri/data map formül zincirinin karşılığı.
export interface BeslenmePlani {
  id: string;
  parcelId: string;
  sezon: string; // "2026" gibi
  hedefAzotKgHa: number; // hedeflenen yıllık saf azot, kg/ha
  hedefN: number; // referans oran (genelde 100)
  hedefP: number; // hedef N:P:K oranındaki P payı
  hedefK: number; // hedef N:P:K oranındaki K payı
  agacSayisiHa: number; // dönüm/ha başına ağaç sayısı
  not?: string;
  createdAt: string;
}

// Plana karşılık fiilen sahada verilen gübre miktarı (öneri ile
// karşılaştırma için).
export interface BeslenmeUygulamaKaydi {
  id: string;
  planId: string;
  parcelId: string;
  tarih: string;
  urun: string; // "AS21" | "MAP" | "K2SO4" | "H3PO4" | "Borax" ...
  miktarKg: number;
  not?: string;
  createdAt: string;
}

// Fertigasyon (damlamadan verilen gübre) dozlama: bir sulama turunda vana
// bazında ne kadar ürün verileceğinden yola çıkarak kaç çuval/bidon
// hazırlanacağı hesaplanır (bkz. src/lib/fertigasyon.ts). Gerçek mühendis
// dosyasındaki (naryeri) "... correct" sayfalarının formül karşılığı.
export type FertigasyonUrun = "AS21" | "K2SO4" | "H3PO4" | "Demir";

export interface FertigasyonKaydi {
  id: string;
  parcelId: string;
  tarih: string;
  urun: FertigasyonUrun;
  vanaAdi?: string;
  suTonaji?: number; // bilgi amaçlı, hesaba girmez
  agacSayisi: number;
  dozAgac: number; // g/ağaç (AS21, K2SO4, Demir) veya cc/ağaç (H3PO4)
  ambalajBoyutu: number; // çuval/bidon başına kg (veya H3PO4 için litre)
  not?: string;
  createdAt: string;
}
