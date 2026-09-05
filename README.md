# TarlaDefteri

Ziraat mühendislerinin sorumlu oldukları parselleri (gübre, sulama, hastalık gibi saha kayıtlarını) takip edip
müşterilerine periyodik rapor gönderebildiği saha yönetim paneli.

## Geliştirme ortamını çalıştırma

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini açın — oturum açmamış her istek `/giris` sayfasına
yönlendirilir.

**Demo giriş bilgileri** (`data/users.json` içindeki seed kullanıcılar, hepsinin şifresi aynı):

| E-posta | Rol | Şifre |
|---|---|---|
| serkan@ornek.com | Yönetici (tüm müşterileri görür) | `sifre123` |
| elif@ornek.com | Ziraat Mühendisi (sadece kendi müşterileri) | `sifre123` |
| baris@ornek.com | Ziraat Mühendisi (sadece kendi müşterileri) | `sifre123` |

## Veri katmanı

Veriler şimdilik `data/*.json` dosyalarında tutuluyor (`src/lib/db.ts`). Proje tamamlanınca MongoDB'ye taşınacak —
`src/lib/repositories.ts` bu geçişte tek değişmesi gereken katman, geri kalan kod (sayfalar, server action'lar)
aynı kalacak şekilde tasarlandı.

## Kimlik doğrulama

- Şifreler `bcryptjs` ile hash'leniyor, oturum `jose` ile imzalanmış bir JWT içinde `httpOnly` cookie'de tutuluyor
  (`src/lib/auth.ts`, `src/lib/session.ts`).
- `src/proxy.ts` (Next.js 16'da `middleware` yerine `proxy`) oturumu olmayan her isteği `/giris`'e yönlendirir.
- Her sayfa ve server action ayrıca kendi içinde `requireUser()` / yetki kontrolü yapıyor — proxy tek koruma katmanı
  değil.
- Roller: **admin** tüm müşterileri görür, **muhendis** sadece `sorumluMuhendisId` kendisine eşit olan müşterileri
  görür/düzenleyebilir.

## Henüz eklenmedi

- Gerçek harita/uydu görüntüsü ve parsel poligon çizimi (şimdilik illüstratif bir yer tutucu var)
- Rapor e-posta gönderimi (PDF önizleme var, gönderim altyapısı yok)
- Kullanıcı ekleme/yetkilendirme arayüzü ve yeni kayıt tipi (parametre) tanımlama formu
