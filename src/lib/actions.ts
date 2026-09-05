"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  records,
  reports,
  customers,
  parcels,
  users,
  gorevler,
  isiHaftalari,
  sulamaPlanlari,
  sulamaKuyulari,
  recordTypes,
  beslenmePlanlari,
  beslenmeUygulamalari,
  fertigasyonKayitlari,
} from "./repositories";
import { requireUser, canAccessCustomer } from "./session";
import { SESSION_COOKIE, SESSION_MAX_AGE, hashPassword, signSessionToken, verifyPassword } from "./auth";
import type { Role, LatLng, GorevDurum, FertigasyonKaydi } from "@/types";
import { polygonAreaDonum, polygonCentroid } from "./geo";
import { haftalikSicaklikGetir } from "./openmeteo";
import { gunlukIsiGuncelle } from "./isiGunluk";

async function requireParcelAccess(parcelId: string) {
  const user = await requireUser();
  const parcel = (await parcels.list()).find((p) => p.id === parcelId);
  const customer = parcel && (await customers.list()).find((c) => c.id === parcel.customerId);
  if (!parcel || !customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu parsele erişim yetkiniz yok.");
  }
  return { user, parcel, customer };
}

export type LoginState = { error: string } | null;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = (await users.list()).find((u) => u.email.toLowerCase() === email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-posta veya şifre hatalı." };
  }

  const token = await signSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/giris");
}

export async function createRecordAction(parcelId: string, formData: FormData) {
  const recordTypeId = String(formData.get("recordTypeId") ?? "");
  const tarih = String(formData.get("tarih") ?? "");
  const not = String(formData.get("not") ?? "");

  const values: Record<string, string | number> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("field:")) {
      const fieldKey = key.slice("field:".length);
      const raw = String(value);
      values[fieldKey] = raw !== "" && !Number.isNaN(Number(raw)) && raw.trim() !== "" && /^-?\d+(\.\d+)?$/.test(raw)
        ? Number(raw)
        : raw;
    }
  }

  const user = await requireUser();

  const parcel = (await parcels.list()).find((p) => p.id === parcelId);
  const customer = parcel && (await customers.list()).find((c) => c.id === parcel.customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu parsele kayıt ekleme yetkiniz yok.");
  }

  await records.create({
    parcelId,
    recordTypeId,
    tarih,
    muhendisId: user.id,
    values,
    not: not || undefined,
  });

  revalidatePath(`/parseller/${parcelId}`);
  redirect(`/parseller/${parcelId}`);
}

async function requireRecordAccess(recordId: string) {
  const record = (await records.list()).find((r) => r.id === recordId);
  if (!record) throw new Error("Kayıt bulunamadı.");
  const { user, parcel, customer } = await requireParcelAccess(record.parcelId);
  return { user, parcel, customer, record };
}

export async function updateRecordAction(recordId: string, formData: FormData) {
  const { parcel } = await requireRecordAccess(recordId);

  const tarih = String(formData.get("tarih") ?? "");
  const not = String(formData.get("not") ?? "");
  const values: Record<string, string | number> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("field:")) {
      const fieldKey = key.slice("field:".length);
      const raw = String(value);
      values[fieldKey] = raw !== "" && /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw;
    }
  }

  await records.update(recordId, { tarih, values, not: not || undefined });

  revalidatePath(`/parseller/${parcel.id}`);
  revalidatePath("/kayitlar");
  redirect(`/parseller/${parcel.id}`);
}

export async function removeRecordAction(recordId: string) {
  const { parcel } = await requireRecordAccess(recordId);
  await records.remove(recordId);

  revalidatePath(`/parseller/${parcel.id}`);
  revalidatePath("/kayitlar");
  redirect(`/parseller/${parcel.id}`);
}

export type CreateUserState = { error: string } | null;

export async function createUserAction(_prevState: CreateUserState, formData: FormData): Promise<CreateUserState> {
  const currentUser = await requireUser();
  if (currentUser.rol !== "admin") {
    return { error: "Kullanıcı ekleme yetkiniz yok." };
  }

  const ad = String(formData.get("ad") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "muhendis") as Role;

  if (!ad || !email || !password) {
    return { error: "Ad, e-posta ve şifre zorunludur." };
  }
  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalı." };
  }
  if (rol !== "admin" && rol !== "muhendis") {
    return { error: "Geçersiz rol." };
  }

  const existing = (await users.list()).find((u) => u.email.toLowerCase() === email);
  if (existing) {
    return { error: "Bu e-posta ile kayıtlı bir kullanıcı zaten var." };
  }

  await users.create({
    ad,
    email,
    passwordHash: await hashPassword(password),
    rol,
  });

  revalidatePath("/ayarlar");
  redirect("/ayarlar");
}

export type UpdateUserState = { error: string } | null;

export async function updateUserAction(
  userId: string,
  _prevState: UpdateUserState,
  formData: FormData,
): Promise<UpdateUserState> {
  const currentUser = await requireUser();
  if (currentUser.rol !== "admin") {
    return { error: "Kullanıcı düzenleme yetkiniz yok." };
  }

  const ad = String(formData.get("ad") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "muhendis") as Role;

  if (!ad || !email) {
    return { error: "Ad ve e-posta zorunludur." };
  }
  if (password && password.length < 6) {
    return { error: "Yeni şifre en az 6 karakter olmalı." };
  }
  if (rol !== "admin" && rol !== "muhendis") {
    return { error: "Geçersiz rol." };
  }
  if (rol !== "admin" && userId === currentUser.id) {
    return { error: "Kendi rolünüzü yönetici dışına düşüremezsiniz." };
  }

  const existing = (await users.list()).find((u) => u.email.toLowerCase() === email && u.id !== userId);
  if (existing) {
    return { error: "Bu e-posta ile kayıtlı başka bir kullanıcı var." };
  }

  await users.update(userId, {
    ad,
    email,
    rol,
    ...(password ? { passwordHash: await hashPassword(password) } : {}),
  });

  revalidatePath("/ayarlar");
  redirect("/ayarlar");
}

export async function removeUserAction(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const currentUser = await requireUser();
  if (currentUser.rol !== "admin") {
    return { ok: false, error: "Kullanıcı silme yetkiniz yok." };
  }
  if (userId === currentUser.id) {
    return { ok: false, error: "Kendi hesabınızı silemezsiniz." };
  }

  const allUsers = await users.list();
  const hedef = allUsers.find((u) => u.id === userId);
  if (!hedef) return { ok: false, error: "Kullanıcı bulunamadı." };
  if (hedef.rol === "admin" && allUsers.filter((u) => u.rol === "admin").length <= 1) {
    return { ok: false, error: "Son yönetici hesabı silinemez." };
  }

  await users.remove(userId);
  revalidatePath("/ayarlar");
  return { ok: true };
}

export async function createCustomerAction(formData: FormData) {
  const user = await requireUser();
  const customer = await customers.create({
    ad: String(formData.get("ad") ?? ""),
    telefon: String(formData.get("telefon") ?? "") || undefined,
    email: String(formData.get("email") ?? "") || undefined,
    adres: String(formData.get("adres") ?? "") || undefined,
    sorumluMuhendisId: user.id,
  });

  revalidatePath("/musteriler");
  redirect(`/musteriler/${customer.id}`);
}

export async function updateCustomerAction(customerId: string, formData: FormData) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteriyi düzenleme yetkiniz yok.");
  }

  await customers.update(customerId, {
    ad: String(formData.get("ad") ?? ""),
    telefon: String(formData.get("telefon") ?? "") || undefined,
    email: String(formData.get("email") ?? "") || undefined,
    adres: String(formData.get("adres") ?? "") || undefined,
  });

  revalidatePath("/musteriler");
  revalidatePath(`/musteriler/${customerId}`);
  redirect(`/musteriler/${customerId}`);
}

// Müşteriyi ve tüm alt varlıklarını (parseller + onların alt kayıtları,
// raporlar, ısı haftaları, sulama kuyuları) siler.
export async function removeCustomerAction(customerId: string) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteriyi silme yetkiniz yok.");
  }

  const [musteriParselleri, allReports, allIsiHaftalari, allKuyular] = await Promise.all([
    parcels.listByCustomer(customerId),
    reports.list(),
    isiHaftalari.listByCustomer(customerId),
    sulamaKuyulari.listByCustomer(customerId),
  ]);

  for (const parcel of musteriParselleri) {
    await cascadeDeleteParcelData(parcel.id);
    await parcels.remove(parcel.id);
  }
  await Promise.all([
    ...allReports.filter((r) => r.customerId === customerId).map((r) => reports.remove(r.id)),
    ...allIsiHaftalari.map((h) => isiHaftalari.remove(h.id)),
    ...allKuyular.map((k) => sulamaKuyulari.remove(k.id)),
  ]);

  await customers.remove(customerId);

  revalidatePath("/musteriler");
  redirect("/musteriler");
}

export async function createParcelAction(customerId: string, formData: FormData) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteriye parsel ekleme yetkiniz yok.");
  }

  const parcel = await parcels.create({
    customerId,
    ad: String(formData.get("ad") ?? ""),
    urun: String(formData.get("urun") ?? ""),
    alanDonum: Number(formData.get("alanDonum") ?? 0),
    agacSayisi: Number(formData.get("agacSayisi") ?? 0) || undefined,
    ekimDuzeni: String(formData.get("ekimDuzeni") ?? "").trim() || undefined,
    sulamaKuyusuId: String(formData.get("sulamaKuyusuId") ?? "").trim() || undefined,
  });

  revalidatePath(`/musteriler/${customerId}`);
  redirect(`/parseller/${parcel.id}`);
}

export async function updateParcelAction(parcelId: string, formData: FormData) {
  const { customer } = await requireParcelAccess(parcelId);

  await parcels.update(parcelId, {
    ad: String(formData.get("ad") ?? ""),
    urun: String(formData.get("urun") ?? ""),
    alanDonum: Number(formData.get("alanDonum") ?? 0),
    agacSayisi: Number(formData.get("agacSayisi") ?? 0) || undefined,
    ekimDuzeni: String(formData.get("ekimDuzeni") ?? "").trim() || undefined,
    sulamaKuyusuId: String(formData.get("sulamaKuyusuId") ?? "").trim() || undefined,
  });

  revalidatePath(`/parseller/${parcelId}`);
  revalidatePath(`/musteriler/${customer.id}`);
  redirect(`/parseller/${parcelId}`);
}

// Bir parselin altındaki tüm alt kayıtları (saha kaydı, görev, sulama planı,
// beslenme planı + uygulamaları) siler — parselin kendisine dokunmaz. Hem
// tekil parsel silmede hem müşteri silmede (her parseli için) kullanılır.
async function cascadeDeleteParcelData(parcelId: string) {
  const [allRecords, allGorevler, allSulamaPlanlari, allBeslenmePlanlari, allBeslenmeUygulamalari] = await Promise.all([
    records.list(),
    gorevler.list(),
    sulamaPlanlari.list(),
    beslenmePlanlari.list(),
    beslenmeUygulamalari.list(),
  ]);

  await Promise.all([
    ...allRecords.filter((r) => r.parcelId === parcelId).map((r) => records.remove(r.id)),
    ...allGorevler.filter((g) => g.parcelId === parcelId).map((g) => gorevler.remove(g.id)),
    ...allSulamaPlanlari.filter((p) => p.parcelId === parcelId).map((p) => sulamaPlanlari.remove(p.id)),
  ]);

  const parselinPlanlari = allBeslenmePlanlari.filter((p) => p.parcelId === parcelId);
  await Promise.all([
    ...allBeslenmeUygulamalari
      .filter((u) => parselinPlanlari.some((p) => p.id === u.planId))
      .map((u) => beslenmeUygulamalari.remove(u.id)),
    ...parselinPlanlari.map((p) => beslenmePlanlari.remove(p.id)),
  ]);
}

export async function removeParcelAction(parcelId: string) {
  const { customer } = await requireParcelAccess(parcelId);

  await cascadeDeleteParcelData(parcelId);
  await parcels.remove(parcelId);

  revalidatePath(`/musteriler/${customer.id}`);
  revalidatePath("/parseller");
  redirect(`/musteriler/${customer.id}`);
}

export async function createSulamaKuyusuAction(customerId: string, formData: FormData) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteri için sulama kuyusu ekleme yetkiniz yok.");
  }

  await sulamaKuyulari.create({
    customerId,
    ad: String(formData.get("ad") ?? ""),
    not: String(formData.get("not") ?? "") || undefined,
  });

  revalidatePath(`/musteriler/${customerId}/sulama-kuyulari`);
  redirect(`/musteriler/${customerId}/sulama-kuyulari`);
}

export async function updateSulamaKuyusuAction(customerId: string, kuyuId: string, formData: FormData) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteri için sulama kuyusu düzenleme yetkiniz yok.");
  }

  await sulamaKuyulari.update(kuyuId, {
    ad: String(formData.get("ad") ?? ""),
    not: String(formData.get("not") ?? "") || undefined,
  });

  revalidatePath(`/musteriler/${customerId}/sulama-kuyulari`);
  revalidatePath("/raporlar/sulama-raporu");
}

// Kuyuyu siler; o kuyuya atanmış parselleri "belirtilmemiş" durumuna
// (sulamaKuyusuId temizlenerek) düşürür, yetim referans bırakmaz.
export async function removeSulamaKuyusuAction(customerId: string, kuyuId: string) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteri için sulama kuyusu silme yetkiniz yok.");
  }

  const etkilenenParseller = (await parcels.listByCustomer(customerId)).filter((p) => p.sulamaKuyusuId === kuyuId);
  await Promise.all(etkilenenParseller.map((p) => parcels.update(p.id, { sulamaKuyusuId: undefined })));
  await sulamaKuyulari.remove(kuyuId);

  revalidatePath(`/musteriler/${customerId}/sulama-kuyulari`);
  revalidatePath("/raporlar/sulama-raporu");
}

export async function updateParcelBoundaryAction(
  parcelId: string,
  sinir: LatLng[],
): Promise<{ ok: true; alanDonum: number } | { ok: false; error: string }> {
  const user = await requireUser();
  const parcel = (await parcels.list()).find((p) => p.id === parcelId);
  const customer = parcel && (await customers.list()).find((c) => c.id === parcel.customerId);
  if (!parcel || !customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    return { ok: false, error: "Bu parseli düzenleme yetkiniz yok." };
  }
  if (sinir.length < 3) {
    return { ok: false, error: "Bir alan çizmek için en az 3 nokta gerekir." };
  }

  const alanDonum = polygonAreaDonum(sinir);
  const konum = polygonCentroid(sinir);

  await parcels.update(parcelId, { sinir, konum, alanDonum });
  revalidatePath(`/parseller/${parcelId}`);
  revalidatePath(`/musteriler/${customer.id}`);

  return { ok: true, alanDonum };
}

export async function createReportDraftAction(customerId: string, formData: FormData) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteri için rapor oluşturma yetkiniz yok.");
  }

  const donemBaslangic = String(formData.get("donemBaslangic") ?? "");
  const donemBitis = String(formData.get("donemBitis") ?? "");
  const ozet = String(formData.get("ozet") ?? "");
  const parcelIds = formData.getAll("parcelIds").map(String);

  const report = await reports.create({
    customerId,
    parcelIds,
    donemBaslangic,
    donemBitis,
    ozet,
    tur: "genel",
  });

  revalidatePath(`/musteriler/${customerId}`);
  redirect(`/raporlar/${report.id}`);
}

async function requireReportAccess(reportId: string) {
  const user = await requireUser();
  const report = (await reports.list()).find((r) => r.id === reportId);
  const customer = report && (await customers.list()).find((c) => c.id === report.customerId);
  if (!report || !customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu rapora erişim yetkiniz yok.");
  }
  return { report, customer };
}

export async function removeReportAction(reportId: string) {
  const { report } = await requireReportAccess(reportId);

  for (const kayitId of report.kaynakKayitIds ?? []) {
    const kayit = (await records.list()).find((r) => r.id === kayitId);
    if (kayit) {
      await records.remove(kayitId);
      revalidatePath(`/parseller/${kayit.parcelId}`);
    }
  }

  await reports.remove(reportId);
  revalidatePath(`/musteriler/${report.customerId}`);
  revalidatePath("/raporlar");
  redirect("/raporlar");
}

export type HaftalikRaporState = { error: string } | null;

export async function createHaftalikRaporAction(
  _prevState: HaftalikRaporState,
  formData: FormData,
): Promise<HaftalikRaporState> {
  const user = await requireUser();

  const customerId = String(formData.get("customerId") ?? "");
  const parcelIds = formData.getAll("parcelIds").map(String);
  const donemBaslangic = String(formData.get("baslangicTarihi") ?? "");
  const donemBitisRaw = String(formData.get("bitisTarihi") ?? "");
  const tarih = String(formData.get("seciliGun") ?? "") || donemBaslangic;
  const recete = String(formData.get("recete") ?? "").trim();
  const gubreleme = String(formData.get("gubreleme") ?? "").trim();
  const fenolojikDonem = String(formData.get("fenolojikDonem") ?? "").trim();
  const durum = String(formData.get("durum") ?? "").trim();
  const aciklama = String(formData.get("aciklama") ?? "").trim();

  if (parcelIds.length === 0 || !donemBaslangic) {
    return { error: "En az bir parsel ve başlangıç tarihi zorunludur." };
  }
  if (donemBitisRaw && donemBitisRaw < donemBaslangic) {
    return { error: "Bitiş tarihi başlangıçtan önce olamaz." };
  }
  const donemBitis = donemBitisRaw && donemBitisRaw !== tarih ? donemBitisRaw : undefined;

  const [allParcels, allCustomers, allTypes, mevcutKayitlar] = await Promise.all([
    parcels.list(),
    customers.list(),
    recordTypes.list(),
    records.list(),
  ]);
  const customer = allCustomers.find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    return { error: "Bu müşteriye kayıt ekleme yetkiniz yok." };
  }
  const secilenParseller = allParcels.filter((p) => parcelIds.includes(p.id));
  if (secilenParseller.length !== parcelIds.length || secilenParseller.some((p) => p.customerId !== customerId)) {
    return { error: "Seçilen parsellerden biri bu müşteriye ait değil." };
  }

  const ilacTuru = allTypes.find((t) => t.ad === "İlaçlama");
  const gubrelemeTuru = allTypes.find((t) => t.ad === "Gübreleme");
  const gozlemTuru = allTypes.find((t) => t.ad === "Gözlem");
  if (!gozlemTuru || (recete && !ilacTuru) || (gubreleme && !gubrelemeTuru)) {
    return { error: "Kayıt tipi bulunamadı — Ayarlar'ı kontrol edin." };
  }

  // Seçili günü kapsayan, aynı tip için o parselde zaten var olan kaydı bulur
  // — varsa günceller, yoksa yeni kayıt oluşturur (toplu düzenleme desteği).
  const mevcutKaydiBul = (parcelId: string, recordTypeId: string) =>
    mevcutKayitlar.find(
      (r) =>
        r.parcelId === parcelId &&
        r.recordTypeId === recordTypeId &&
        r.tarih <= tarih &&
        (r.donemBitis ?? r.tarih) >= tarih,
    );

  const kaynakKayitIds: string[] = [];

  for (const parcelId of parcelIds) {
    const ortakAlanlar = {
      tarih,
      not: aciklama || undefined,
      fenolojikDonem: fenolojikDonem || undefined,
      durum: durum || undefined,
      donemBitis,
    };

    if (recete && ilacTuru) {
      const mevcut = mevcutKaydiBul(parcelId, ilacTuru.id);
      const values = { etkenMadde: "Karışım", hedef: "Genel", recete };
      if (mevcut) {
        await records.update(mevcut.id, { ...ortakAlanlar, values });
        kaynakKayitIds.push(mevcut.id);
      } else {
        const kayit = await records.create({ parcelId, recordTypeId: ilacTuru.id, muhendisId: user.id, values, ...ortakAlanlar });
        kaynakKayitIds.push(kayit.id);
      }
    }

    if (gubreleme && gubrelemeTuru) {
      const mevcut = mevcutKaydiBul(parcelId, gubrelemeTuru.id);
      const values = { detay: gubreleme };
      if (mevcut) {
        await records.update(mevcut.id, { ...ortakAlanlar, values });
        kaynakKayitIds.push(mevcut.id);
      } else {
        const kayit = await records.create({ parcelId, recordTypeId: gubrelemeTuru.id, muhendisId: user.id, values, ...ortakAlanlar });
        kaynakKayitIds.push(kayit.id);
      }
    }

    if (!recete && !gubreleme) {
      const mevcut = mevcutKaydiBul(parcelId, gozlemTuru.id);
      if (mevcut) {
        await records.update(mevcut.id, { ...ortakAlanlar, values: {} });
        kaynakKayitIds.push(mevcut.id);
      } else {
        const kayit = await records.create({ parcelId, recordTypeId: gozlemTuru.id, muhendisId: user.id, values: {}, ...ortakAlanlar });
        kaynakKayitIds.push(kayit.id);
      }
    }

    revalidatePath(`/parseller/${parcelId}`);
  }

  await reports.create({
    customerId,
    parcelIds,
    donemBaslangic,
    donemBitis: donemBitisRaw || donemBaslangic,
    ozet: aciklama || "Haftalık ziyaret raporu",
    tur: "haftalik",
    kaynakKayitIds,
  });

  revalidatePath(`/musteriler/${customerId}`);
  redirect(`/raporlar/haftalik-rapor?musteriId=${customerId}`);
}

export async function createGorevAction(parcelId: string, formData: FormData) {
  const { user } = await requireParcelAccess(parcelId);

  await gorevler.create({
    parcelId,
    konu: String(formData.get("konu") ?? ""),
    gozlem: String(formData.get("gozlem") ?? ""),
    onerilenUygulama: String(formData.get("onerilenUygulama") ?? "") || undefined,
    sorumluId: String(formData.get("sorumluId") ?? "") || user.id,
    terminTarihi: String(formData.get("terminTarihi") ?? "") || undefined,
    durum: (String(formData.get("durum") ?? "planlandi") as GorevDurum) || "planlandi",
    tarih: String(formData.get("tarih") ?? new Date().toISOString().slice(0, 10)),
  });

  revalidatePath(`/parseller/${parcelId}`);
  redirect(`/parseller/${parcelId}`);
}

export type CreateGorevYeniState = { error: string } | null;

// /gorevler sayfasından doğrudan — önce müşteri/parsel seçilip görev
// oluşturulabilsin diye. parcelId formdan gelir (route parametresi yok).
export async function createGorevYeniAction(
  _prevState: CreateGorevYeniState,
  formData: FormData,
): Promise<CreateGorevYeniState> {
  const parcelId = String(formData.get("parcelId") ?? "");
  if (!parcelId) return { error: "Önce müşteri ve parsel seçmelisin." };

  const { user } = await requireParcelAccess(parcelId);

  await gorevler.create({
    parcelId,
    konu: String(formData.get("konu") ?? ""),
    gozlem: String(formData.get("gozlem") ?? ""),
    onerilenUygulama: String(formData.get("onerilenUygulama") ?? "") || undefined,
    sorumluId: String(formData.get("sorumluId") ?? "") || user.id,
    terminTarihi: String(formData.get("terminTarihi") ?? "") || undefined,
    durum: (String(formData.get("durum") ?? "planlandi") as GorevDurum) || "planlandi",
    tarih: String(formData.get("tarih") ?? new Date().toISOString().slice(0, 10)),
  });

  revalidatePath(`/parseller/${parcelId}`);
  revalidatePath("/gorevler");
  redirect("/gorevler");
}

export async function updateGorevDurumAction(
  gorevId: string,
  parcelId: string,
  durum: GorevDurum,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireParcelAccess(parcelId);
  } catch {
    return { ok: false, error: "Bu göreve erişim yetkiniz yok." };
  }

  await gorevler.update(gorevId, { durum });
  revalidatePath(`/parseller/${parcelId}`);
  revalidatePath("/gorevler");
  return { ok: true };
}

export async function updateGorevAction(gorevId: string, parcelId: string, formData: FormData) {
  await requireParcelAccess(parcelId);

  await gorevler.update(gorevId, {
    konu: String(formData.get("konu") ?? ""),
    gozlem: String(formData.get("gozlem") ?? ""),
    onerilenUygulama: String(formData.get("onerilenUygulama") ?? "") || undefined,
    sorumluId: String(formData.get("sorumluId") ?? "") || undefined,
    terminTarihi: String(formData.get("terminTarihi") ?? "") || undefined,
    tarih: String(formData.get("tarih") ?? ""),
    not: String(formData.get("not") ?? "") || undefined,
  });

  revalidatePath(`/parseller/${parcelId}`);
  revalidatePath("/gorevler");
  redirect(`/parseller/${parcelId}?sekme=gorevler`);
}

export async function removeGorevAction(gorevId: string, parcelId: string) {
  await requireParcelAccess(parcelId);
  await gorevler.remove(gorevId);
  revalidatePath(`/parseller/${parcelId}`);
  revalidatePath("/gorevler");
}

export async function createSulamaPlaniAction(parcelId: string, formData: FormData) {
  await requireParcelAccess(parcelId);

  const donemBaslangic = String(formData.get("donemBaslangic") ?? "");
  const donemBitis = String(formData.get("donemBitis") ?? "");
  const araGun = Number(formData.get("araGun") ?? 3);

  const tarihler: string[] = [];
  const cursor = new Date(donemBaslangic + "T00:00:00Z");
  const bitis = new Date(donemBitis + "T00:00:00Z");
  while (cursor <= bitis) {
    tarihler.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + Math.max(1, araGun));
  }

  await sulamaPlanlari.create({
    parcelId,
    donemBaslangic,
    donemBitis,
    planlananTarihler: tarihler,
  });

  revalidatePath(`/parseller/${parcelId}/sulama-uyumu`);
  redirect(`/parseller/${parcelId}/sulama-uyumu`);
}

export async function removeSulamaPlaniAction(parcelId: string, planId: string) {
  await requireParcelAccess(parcelId);
  await sulamaPlanlari.remove(planId);
  revalidatePath(`/parseller/${parcelId}/sulama-uyumu`);
}

// Sulama Raporu ızgarasında tek bir (parsel, gün) hücresini günceller. Aynı
// parsel+tarih için zaten bir Sulama kaydı varsa süresini günceller, yoksa
// yeni bir kayıt oluşturur; 0/boş girilirse kaydı siler.
export async function updateSulamaSaatiAction(
  parcelId: string,
  tarih: string,
  saat: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireParcelAccess(parcelId);
  } catch {
    return { ok: false, error: "Bu parsele erişim yetkiniz yok." };
  }

  const user = await requireUser();
  const [allRecords, allTypes] = await Promise.all([records.list(), recordTypes.list()]);
  const sulamaType = allTypes.find((t) => t.ad === "Sulama");
  if (!sulamaType) return { ok: false, error: "Sulama kayıt tipi bulunamadı." };

  const mevcut = allRecords.find(
    (r) => r.parcelId === parcelId && r.recordTypeId === sulamaType.id && r.tarih === tarih,
  );

  if (!saat || saat <= 0) {
    if (mevcut) await records.remove(mevcut.id);
  } else if (mevcut) {
    await records.update(mevcut.id, { values: { ...mevcut.values, sure: saat } });
  } else {
    await records.create({
      parcelId,
      recordTypeId: sulamaType.id,
      tarih,
      muhendisId: user.id,
      values: { sure: saat, yontem: "Damla" },
    });
  }

  revalidatePath("/raporlar/sulama-raporu");
  revalidatePath(`/parseller/${parcelId}`);
  return { ok: true };
}

export async function createBeslenmePlaniAction(parcelId: string, formData: FormData) {
  await requireParcelAccess(parcelId);

  await beslenmePlanlari.create({
    parcelId,
    sezon: String(formData.get("sezon") ?? ""),
    hedefAzotKgHa: Number(formData.get("hedefAzotKgHa") ?? 0),
    hedefN: Number(formData.get("hedefN") ?? 100),
    hedefP: Number(formData.get("hedefP") ?? 0),
    hedefK: Number(formData.get("hedefK") ?? 0),
    agacSayisiHa: Number(formData.get("agacSayisiHa") ?? 0),
    not: String(formData.get("not") ?? "") || undefined,
  });

  revalidatePath(`/parseller/${parcelId}/beslenme`);
  redirect(`/parseller/${parcelId}/beslenme`);
}

export async function updateBeslenmePlaniAction(parcelId: string, planId: string, formData: FormData) {
  await requireParcelAccess(parcelId);

  await beslenmePlanlari.update(planId, {
    sezon: String(formData.get("sezon") ?? ""),
    hedefAzotKgHa: Number(formData.get("hedefAzotKgHa") ?? 0),
    hedefN: Number(formData.get("hedefN") ?? 100),
    hedefP: Number(formData.get("hedefP") ?? 0),
    hedefK: Number(formData.get("hedefK") ?? 0),
    agacSayisiHa: Number(formData.get("agacSayisiHa") ?? 0),
    not: String(formData.get("not") ?? "") || undefined,
  });

  revalidatePath(`/parseller/${parcelId}/beslenme`);
  redirect(`/parseller/${parcelId}/beslenme`);
}

// Planı ve ona bağlı gerçekleşen uygulama kayıtlarını siler.
export async function removeBeslenmePlaniAction(parcelId: string, planId: string) {
  await requireParcelAccess(parcelId);

  const uygulamalar = await beslenmeUygulamalari.listByPlan(planId);
  await Promise.all(uygulamalar.map((u) => beslenmeUygulamalari.remove(u.id)));
  await beslenmePlanlari.remove(planId);

  revalidatePath(`/parseller/${parcelId}/beslenme`);
}

export async function createBeslenmeUygulamaAction(parcelId: string, planId: string, formData: FormData) {
  await requireParcelAccess(parcelId);

  await beslenmeUygulamalari.create({
    planId,
    parcelId,
    tarih: String(formData.get("tarih") ?? ""),
    urun: String(formData.get("urun") ?? ""),
    miktarKg: Number(formData.get("miktarKg") ?? 0),
    not: String(formData.get("not") ?? "") || undefined,
  });

  revalidatePath(`/parseller/${parcelId}/beslenme`);
  redirect(`/parseller/${parcelId}/beslenme`);
}

export async function removeBeslenmeUygulamaAction(parcelId: string, id: string) {
  await requireParcelAccess(parcelId);
  await beslenmeUygulamalari.remove(id);
  revalidatePath(`/parseller/${parcelId}/beslenme`);
}

export async function createFertigasyonKaydiAction(parcelId: string, formData: FormData) {
  await requireParcelAccess(parcelId);

  await fertigasyonKayitlari.create({
    parcelId,
    tarih: String(formData.get("tarih") ?? ""),
    urun: String(formData.get("urun") ?? "AS21") as FertigasyonKaydi["urun"],
    vanaAdi: String(formData.get("vanaAdi") ?? "") || undefined,
    suTonaji: formData.get("suTonaji") ? Number(formData.get("suTonaji")) : undefined,
    agacSayisi: Number(formData.get("agacSayisi") ?? 0),
    dozAgac: Number(formData.get("dozAgac") ?? 0),
    ambalajBoyutu: Number(formData.get("ambalajBoyutu") ?? 1),
    not: String(formData.get("not") ?? "") || undefined,
  });

  revalidatePath(`/parseller/${parcelId}/fertigasyon`);
  redirect(`/parseller/${parcelId}/fertigasyon`);
}

export async function removeFertigasyonKaydiAction(parcelId: string, id: string) {
  await requireParcelAccess(parcelId);
  await fertigasyonKayitlari.remove(id);
  revalidatePath(`/parseller/${parcelId}/fertigasyon`);
}

export async function createIsiHaftasiAction(customerId: string, formData: FormData) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteri için iklim kaydı ekleme yetkiniz yok.");
  }

  const parseOptionalNumber = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim();
    return raw === "" ? undefined : Number(raw);
  };

  await isiHaftalari.create({
    customerId,
    haftaBaslangic: String(formData.get("haftaBaslangic") ?? ""),
    ortSicaklik: parseOptionalNumber("ortSicaklik"),
    minSicaklik: parseOptionalNumber("minSicaklik"),
    maksSicaklik: parseOptionalNumber("maksSicaklik"),
    yagis: parseOptionalNumber("yagis"),
    nem: parseOptionalNumber("nem"),
    rapordakiKumulatifGdd: parseOptionalNumber("rapordakiKumulatifGdd"),
    not: String(formData.get("not") ?? "") || undefined,
  });

  revalidatePath(`/musteriler/${customerId}/isi-toplami`);
  redirect(`/musteriler/${customerId}/isi-toplami`);
}

export async function updateIsiHaftasiAction(customerId: string, haftaId: string, formData: FormData) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteri için iklim kaydı düzenleme yetkiniz yok.");
  }

  const parseOptionalNumber = (key: string) => {
    const raw = String(formData.get(key) ?? "").trim();
    return raw === "" ? undefined : Number(raw);
  };

  await isiHaftalari.update(haftaId, {
    haftaBaslangic: String(formData.get("haftaBaslangic") ?? ""),
    ortSicaklik: parseOptionalNumber("ortSicaklik"),
    minSicaklik: parseOptionalNumber("minSicaklik"),
    maksSicaklik: parseOptionalNumber("maksSicaklik"),
    yagis: parseOptionalNumber("yagis"),
    nem: parseOptionalNumber("nem"),
    rapordakiKumulatifGdd: parseOptionalNumber("rapordakiKumulatifGdd"),
    not: String(formData.get("not") ?? "") || undefined,
  });

  revalidatePath(`/musteriler/${customerId}/isi-toplami`);
  redirect(`/musteriler/${customerId}/isi-toplami`);
}

export async function removeIsiHaftasiAction(customerId: string, haftaId: string) {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    throw new Error("Bu müşteri için iklim kaydı silme yetkiniz yok.");
  }
  await isiHaftalari.remove(haftaId);
  revalidatePath(`/musteriler/${customerId}/isi-toplami`);
}

// Isı Toplamı haftasını elle girmek yerine, müşterinin parsellerinin konum
// ortalamasına göre Open-Meteo'dan otomatik çeker. Aynı hafta zaten varsa
// sıcaklık alanlarını günceller, yoksa yeni hafta oluşturur.
export async function haftalikSicaklikCekAction(
  customerId: string,
  haftaBaslangic: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    return { ok: false, error: "Bu müşteri için iklim kaydı ekleme yetkiniz yok." };
  }
  if (!haftaBaslangic) {
    return { ok: false, error: "Hafta başlangıcı seçmelisin." };
  }

  const musteriParselleri = (await parcels.list()).filter((p) => p.customerId === customerId && p.konum);
  if (musteriParselleri.length === 0) {
    return { ok: false, error: "Bu müşterinin konumu tanımlı hiçbir parseli yok — önce parsele konum işaretle." };
  }

  const merkez = polygonCentroid(musteriParselleri.map((p) => p.konum!));
  const sonuc = await haftalikSicaklikGetir(merkez.lat, merkez.lng, haftaBaslangic);
  if (!sonuc) {
    return { ok: false, error: "Hava durumu servisinden veri alınamadı, tekrar dene." };
  }

  const mevcut = (await isiHaftalari.listByCustomer(customerId)).find((h) => h.haftaBaslangic === haftaBaslangic);
  if (mevcut) {
    await isiHaftalari.update(mevcut.id, sonuc);
  } else {
    await isiHaftalari.create({ customerId, haftaBaslangic, ...sonuc });
  }

  revalidatePath(`/musteriler/${customerId}/isi-toplami`);
  return { ok: true };
}

export async function isiGunlukBackfillAction(
  customerId: string,
  gunSayisi: number = 30,
): Promise<{ ok: true; islenenGun: number } | { ok: false; error: string }> {
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) {
    return { ok: false, error: "Bu müşteri için iklim kaydı ekleme yetkiniz yok." };
  }

  const sonuc = await gunlukIsiGuncelle(customerId, gunSayisi);
  if (sonuc.ok) revalidatePath("/raporlar/isi-gunlugu");
  return sonuc;
}
