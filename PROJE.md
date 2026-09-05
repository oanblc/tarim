# TarlaDefteri — Proje Özeti

Ziraat mühendislerinin parsel ziyaretlerini (gübre/sulama/hastalık/gözlem), görevlerini ve müşteri (çiftlik sahibi) raporlarını takip ettiği, mühendislerin bugün Excel'de yürüttüğü işi birebir replike edip dijitalleştiren web uygulaması. Sahibi: Ozan Balcıoğlu — son karar her zaman onda.

Bu Claude Code oturumunda proje için 8 kişilik ajan ekibi kuruldu.

## Ürün kararları (sabit — değiştirmeden önce urun-yoneticisi'ne danış)
- **Kapsam:** Web-only, mobil yok. Rol bazlı erişim: `admin` (tüm müşteriler) ve `muhendis` (sadece kendine atanan müşteriler) — bu ayrım hem proxy/middleware hem her sayfa/action içinde ayrı ayrı kontrol edilir (Next.js'in kendi önerdiği savunma-derinliği yaklaşımı).
- **Metodoloji:** Her yeni özellik önce gerçek mühendis Excel dosyasının (bkz. "Kaynak dosyalar") hücre FORMÜLLERİ SheetJS ile çıkarılıp doğrulanarak, sonra koda geçirilir — görsel/yapısal analiz tek başına yeterli sayılmaz.
- **Birim:** Alan birimi dönüm (1000 m²) — hektar değil, mühendislerin gerçekte kullandığı birim.
- **Veri katmanı:** Şu an dosya tabanlı JSON depo (`src/lib/db.ts`). İleride MongoDB'ye geçilecek; sadece `db.ts`/`repositories.ts` değişecek şekilde tasarlandı — bu sınırı koru.

## Teknoloji yığını
- Next.js 16 (App Router, Turbopack, `src/` dizini) — bu sürüm `middleware.ts`'i `proxy.ts` yaptı, typed route helper'lar (`PageProps<'/route'>`) için `npx next typegen` şart. Kod yazmadan önce `node_modules/next/dist/docs/`'a bak (bkz. `AGENTS.md`).
- Kimlik doğrulama: bcryptjs + jose (JWT, httpOnly cookie).
- Harita: Mapbox GL JS + `@mapbox/mapbox-gl-draw` + `@turf/area`.
- Stil: Tailwind v4 (`@theme inline`).
- Test: Playwright (`playwright-core` + gerçek Chrome, `channel: 'chrome'`).

## Tasarım sistemi
- Manrope font, koyu yeşil `#1F2B22` sidebar, ana yeşil `#4C7A46`, krem zemin `#F7F5EF`.
- Sidebar linkleri etiketli (ikon-only değil). İkon: emoji yasak, stroke SVG (Lucide tarzı, 24px viewBox, ~1.7-1.8 stroke).
- Rapor kutuları (raporlar sayfası) elle çizilmiş inline SVG sahne illüstrasyonu + gradyan renk overlay ile (bkz. `FarmSceneArt`, `WaterSceneArt`).
- Görsel onay kuralı: bkz. [[tasarim-kalite-cubugu]] — kritik ölçüde değil ama Ozan görsel geri bildirimi verince (hizalama, okunabilirlik, kompaktlık) doğrudan uygulanır.

## Kaynak dosyalar (mühendisin gerçek Excel dosyaları — hepsi analiz edildi)
`~/Downloads/onedrivedosyalar/` altında salt-okunur duruyor, hiçbiri değiştirilmez:
- **arıkoğlu çiftlik Haftalık Rapor** → Haftalık Rapor modülü
- **arıkoglu sulama** → Sulama Raporu + Sulama Uyumu modülleri
- **naryeri** → Beslenme Programı modülü (N-P-K gübre dozlama motoru — CALISMA→öneri 2024→data map formül zinciri)
- **Oral yarbaşı çiftlik Haftalık Rapor**, **Yarbaşı_sulama_programı** → mevcut Haftalık Rapor / Sulama Uyumu modellerini farklı çiftlikte doğruladı, yeni özellik gerektirmedi
- **ORAL YARBAŞI YPRK GÜBRE**, **Remziye_Ahmet_Karabucak_Fasulye yeri** (Gübreleme/Yaprak Gübresi/İlaçlama sekmeleri) → mevcut genel `RecordTypeDef`/`FieldRecord` şeması zaten karşılıyor, yeni kod gerekmedi
- **Remziye_Ahmet_Karabucak_Fasulye yeri "Özet" sayfası** → Haftalık Özet raporu (yeni): Isı Toplamı haftalarına göre sulama/gübre/yaprak gübresi/ilaç/gözlem sayılarının otomatik haftalık panoraması

## Mevcut özellikler (kod tabanında yaşıyor, burada tekrar detaylandırılmaz)
Auth+rol, müşteri/parsel CRUD+harita, kayıt tipleri (Gübreleme/Sulama/Hastalık-Zararlı/Gözlem/Yaprak Gübresi/İlaçlama), Görevler, Isı Toplamı (GDD), Sulama Uyumu (planlanan/uygulanan puanlama), Raporlar (Haftalık Rapor, Sulama Raporu, Haftalık Özet), Beslenme Programı, Sulama Kuyusu (bağımsız varlık, parsele atanır).

## Düzenleme/silme kapsamı
Ozan'ın talebi üzerine "eklenen her şey düzenlenebilir/silinebilir olsun" ilkesi uygulandı: müşteri, parsel, saha kaydı, görev, sulama planı, sulama kuyusu, ısı haftası, beslenme planı (+ uygulaması), rapor, kullanıcı — hepsinde düzenle/sil var. Kademeli silme (cascade) uygulanır: parsel silinince altındaki kayıt/görev/plan da silinir; müşteri silinince altındaki parseller de (kademeli olarak) silinir.

**Bilinen teknik kısıt**: `?sekme=gorevler` gibi arama parametreli sayfalarda Next 16'nın `router.refresh()`'i güncel veriyi güvenilir yansıtmadı (görev silme örneğinde tespit edildi) — bu tür sayfalarda silme işlemleri `SilButonu` bileşeninde `window.location.reload()` ile tam sayfa yenilemeye çevrildi. Ayrıca dosya tabanlı depo kilitlemesiz yazdığı için hızlı ardışık işlemlerde nadir zamanlama tutarsızlıkları (test sırasında gözlemlendi, nihai veri hep doğru) olabilir — Mongo geçişine kadar bilinen sınırlama.

## Dış entegrasyonlar
- **Open-Meteo** (`src/lib/openmeteo.ts`, API anahtarsız, ücretsiz): Isı Toplamı haftalarını elle girmek yerine, müşterinin konumlu parsellerinin merkez noktasına göre otomatik çeker (`haftalikSicaklikCekAction`). Geçmiş tarihler için archive-api (ERA5, ~5 gün gecikmeli), yakın/gelecek tarihler için forecast API kullanılır. Model/reanalysis verisi olduğu için MGM istasyon verisine göre birkaç derece sapabilir — bilinen sınırlama, MGM'in halka açık kolay entegre edilebilir bir API'si yok.

## Açık sorular
- `sulamaKuyusu` alanının `/parseller` liste sayfasında da gösterilip gösterilmeyeceği — Ozan'a soruldu, henüz yanıt yok.
- Beslenme Programı'nın müşteri raporlarına (Raporlar sekmesi) özet çıktı olarak eklenip eklenmeyeceği — şimdilik sadece parsel içi planlama aracı.

## Sahiplik
Ozan Balcıoğlu — son karar her zaman onda.
