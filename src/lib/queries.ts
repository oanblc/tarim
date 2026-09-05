import {
  customers,
  parcels,
  recordTypes,
  records,
  reports,
  users,
  gorevler,
  isiHaftalari,
  sulamaPlanlari,
  sulamaKuyulari,
  beslenmePlanlari,
  beslenmeUygulamalari,
  fertigasyonKayitlari,
  isiGunlukleri,
} from "./repositories";
import { canAccessCustomer } from "./session";
import { sulamaUyumuHesapla, haftalikGdd, kumulatifGddHesapla } from "./tarim";
import { beslenmePlaniHesapla } from "./beslenme";
import { fertigasyonHesapla } from "./fertigasyon";
import type { User } from "@/types";

function visibleCustomerIds(user: User, allCustomers: Awaited<ReturnType<typeof customers.list>>) {
  if (user.rol === "admin") return new Set(allCustomers.map((c) => c.id));
  return new Set(allCustomers.filter((c) => c.sorumluMuhendisId === user.id).map((c) => c.id));
}

export async function getRecentRecordsView(user: User, limit = 6) {
  const [allRecords, allParcels, allCustomers, allTypes, allUsers] = await Promise.all([
    records.list(),
    parcels.list(),
    customers.list(),
    recordTypes.list(),
    users.list(),
  ]);

  const visible = visibleCustomerIds(user, allCustomers);

  return allRecords
    .filter((r) => {
      const parcel = allParcels.find((p) => p.id === r.parcelId);
      return parcel && visible.has(parcel.customerId);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((r) => {
      const parcel = allParcels.find((p) => p.id === r.parcelId);
      const customer = allCustomers.find((c) => c.id === parcel?.customerId);
      const type = allTypes.find((t) => t.id === r.recordTypeId);
      const engineer = allUsers.find((u) => u.id === r.muhendisId);
      return { record: r, parcel, customer, type, engineer };
    });
}

export async function getDashboardStats(user: User) {
  const [allCustomers, allParcels, allRecords] = await Promise.all([
    customers.list(),
    parcels.list(),
    records.list(),
  ]);

  const visible = visibleCustomerIds(user, allCustomers);
  const visibleParcels = allParcels.filter((p) => visible.has(p.customerId));
  const visibleParcelIds = new Set(visibleParcels.map((p) => p.id));
  const visibleRecords = allRecords.filter((r) => visibleParcelIds.has(r.parcelId));

  const now = new Date();
  const thisMonthCount = visibleRecords.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return {
    customerCount: visible.size,
    parcelCount: visibleParcels.length,
    recordCount: visibleRecords.length,
    thisMonthCount,
  };
}

export async function getCustomersView(user: User) {
  const [allCustomers, allParcels, allUsers] = await Promise.all([
    customers.list(),
    parcels.list(),
    users.list(),
  ]);

  const visible = visibleCustomerIds(user, allCustomers);

  return allCustomers
    .filter((c) => visible.has(c.id))
    .map((c) => ({
      customer: c,
      parcelCount: allParcels.filter((p) => p.customerId === c.id).length,
      engineer: allUsers.find((u) => u.id === c.sorumluMuhendisId),
    }));
}

export async function getCustomerDetail(customerId: string, user: User) {
  const [allCustomers, allParcels, allUsers, allRecords, musteriRaporlari] = await Promise.all([
    customers.list(),
    parcels.listByCustomer(customerId),
    users.list(),
    records.list(),
    reports.listByCustomer(customerId),
  ]);

  const customer = allCustomers.find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const engineer = allUsers.find((u) => u.id === customer.sorumluMuhendisId);
  const parcelsWithLastRecord = allParcels.map((p) => {
    const parcelRecords = allRecords.filter((r) => r.parcelId === p.id);
    const last = parcelRecords.slice().sort((a, b) => b.tarih.localeCompare(a.tarih))[0];
    return { parcel: p, lastRecordDate: last?.tarih, sonDurum: last?.durum };
  });

  const raporlar = musteriRaporlari.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { customer, engineer, parcels: parcelsWithLastRecord, raporlar };
}

export async function getParcelDetail(parcelId: string, user: User) {
  const [allParcels, allCustomers, allRecords, allTypes, allUsers, allGorevler, allKuyular] = await Promise.all([
    parcels.list(),
    customers.list(),
    records.listByParcel(parcelId),
    recordTypes.list(),
    users.list(),
    gorevler.listByParcel(parcelId),
    sulamaKuyulari.list(),
  ]);

  const parcel = allParcels.find((p) => p.id === parcelId);
  if (!parcel) return null;
  const customer = allCustomers.find((c) => c.id === parcel.customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;
  const kuyu = allKuyular.find((k) => k.id === parcel.sulamaKuyusuId);

  const timeline = allRecords
    .slice()
    .sort((a, b) => b.tarih.localeCompare(a.tarih))
    .map((r) => ({
      record: r,
      type: allTypes.find((t) => t.id === r.recordTypeId),
      engineer: allUsers.find((u) => u.id === r.muhendisId),
    }));

  const gorevlerListesi = allGorevler
    .slice()
    .sort((a, b) => b.tarih.localeCompare(a.tarih))
    .map((g) => ({ gorev: g, sorumlu: allUsers.find((u) => u.id === g.sorumluId) }));

  return { parcel, customer, timeline, gorevler: gorevlerListesi, kuyu };
}

export async function getSulamaKuyulariView(customerId: string, user: User) {
  const [allCustomers, allKuyular, allParcels] = await Promise.all([
    customers.list(),
    sulamaKuyulari.listByCustomer(customerId),
    parcels.listByCustomer(customerId),
  ]);

  const customer = allCustomers.find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const kuyular = allKuyular
    .slice()
    .sort((a, b) => a.ad.localeCompare(b.ad))
    .map((kuyu) => ({ kuyu, parseller: allParcels.filter((p) => p.sulamaKuyusuId === kuyu.id) }));

  const kuyusuzParseller = allParcels.filter((p) => !p.sulamaKuyusuId);

  return { customer, kuyular, kuyusuzParseller };
}

export async function getGorevlerView(user: User) {
  const [allGorevler, allParcels, allCustomers, allUsers] = await Promise.all([
    gorevler.list(),
    parcels.list(),
    customers.list(),
    users.list(),
  ]);

  const visible = visibleCustomerIds(user, allCustomers);

  return allGorevler
    .filter((g) => {
      const parcel = allParcels.find((p) => p.id === g.parcelId);
      return parcel && visible.has(parcel.customerId);
    })
    .sort((a, b) => b.tarih.localeCompare(a.tarih))
    .map((g) => {
      const parcel = allParcels.find((p) => p.id === g.parcelId);
      const customer = allCustomers.find((c) => c.id === parcel?.customerId);
      const sorumlu = allUsers.find((u) => u.id === g.sorumluId);
      return { gorev: g, parcel, customer, sorumlu };
    });
}

export async function getSulamaUyumuView(parcelId: string, user: User) {
  const [allParcels, allCustomers, allPlanlar, allRecords, allTypes] = await Promise.all([
    parcels.list(),
    customers.list(),
    sulamaPlanlari.listByParcel(parcelId),
    records.listByParcel(parcelId),
    recordTypes.list(),
  ]);

  const parcel = allParcels.find((p) => p.id === parcelId);
  if (!parcel) return null;
  const customer = allCustomers.find((c) => c.id === parcel.customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const sulamaType = allTypes.find((t) => t.ad.toLowerCase() === "sulama");
  const uygulananTarihler = allRecords.filter((r) => r.recordTypeId === sulamaType?.id).map((r) => r.tarih);

  const planlar = allPlanlar
    .slice()
    .sort((a, b) => b.donemBaslangic.localeCompare(a.donemBaslangic))
    .map((plan) => ({
      plan,
      sonuc: sulamaUyumuHesapla(plan.planlananTarihler, uygulananTarihler),
    }));

  return { parcel, customer, planlar, uygulananTarihler };
}

export async function getBeslenmeProgramiView(parcelId: string, user: User) {
  const [allParcels, allCustomers, allPlanlar, allUygulamalar] = await Promise.all([
    parcels.list(),
    customers.list(),
    beslenmePlanlari.listByParcel(parcelId),
    beslenmeUygulamalari.list(),
  ]);

  const parcel = allParcels.find((p) => p.id === parcelId);
  if (!parcel) return null;
  const customer = allCustomers.find((c) => c.id === parcel.customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const planlar = allPlanlar
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((plan) => ({
      plan,
      sonuc: beslenmePlaniHesapla(plan, parcel.alanDonum),
      uygulamalar: allUygulamalar
        .filter((u) => u.planId === plan.id)
        .sort((a, b) => b.tarih.localeCompare(a.tarih)),
    }));

  return { parcel, customer, planlar };
}

export async function getFertigasyonView(parcelId: string, user: User) {
  const [allParcels, allCustomers, allKayitlar] = await Promise.all([
    parcels.list(),
    customers.list(),
    fertigasyonKayitlari.listByParcel(parcelId),
  ]);

  const parcel = allParcels.find((p) => p.id === parcelId);
  if (!parcel) return null;
  const customer = allCustomers.find((c) => c.id === parcel.customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const kayitlar = allKayitlar
    .slice()
    .sort((a, b) => b.tarih.localeCompare(a.tarih) || b.createdAt.localeCompare(a.createdAt))
    .map((kayit) => ({ kayit, sonuc: fertigasyonHesapla(kayit) }));

  return { parcel, customer, kayitlar };
}

export async function getIsiGunluguView(customerId: string, user: User) {
  const [allCustomers, allKayitlar] = await Promise.all([customers.list(), isiGunlukleri.listByCustomer(customerId)]);

  const customer = allCustomers.find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const gunler = allKayitlar.slice().sort((a, b) => b.tarih.localeCompare(a.tarih));

  return { customer, gunler };
}

// Haftalık Özet: bir müşterinin tanımlı Isı Toplamı haftalarına göre,
// o hafta içindeki sulama/gübre/yaprak gübresi/ilaç/gözlem kayıtlarını
// otomatik toplayan haftalık panorama (Excel'deki "Özet" sayfasının
// karşılığı — orada da tüm sütunlar diğer sekmelerden otomatik toplanıyordu).
export async function getHaftalikOzetView(customerId: string, user: User) {
  const [allCustomers, allParcels, allHaftalar, allRecords, allTypes] = await Promise.all([
    customers.list(),
    parcels.list(),
    isiHaftalari.listByCustomer(customerId),
    records.list(),
    recordTypes.list(),
  ]);

  const customer = allCustomers.find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const parcelIds = new Set(allParcels.filter((p) => p.customerId === customerId).map((p) => p.id));
  const musteriKayitlari = allRecords.filter((r) => parcelIds.has(r.parcelId));

  const typeIdByAd = (ad: string) => allTypes.find((t) => t.ad.toLowerCase() === ad.toLowerCase())?.id;
  const sulamaId = typeIdByAd("Sulama");
  const gubrelemeId = typeIdByAd("Gübreleme");
  const yaprakGubresiId = typeIdByAd("Yaprak Gübresi");
  const ilaclamaId = typeIdByAd("İlaçlama");
  const gozlemId = typeIdByAd("Gözlem");
  const hastalikId = typeIdByAd("Hastalık / Zararlı");

  const siraliHaftalar = allHaftalar.slice().sort((a, b) => a.haftaBaslangic.localeCompare(b.haftaBaslangic));
  const kumulatifler = kumulatifGddHesapla(
    siraliHaftalar.map((h) => ({
      haftalikGdd: h.ortSicaklik !== undefined ? haftalikGdd(h.ortSicaklik) : undefined,
      rapordakiKumulatifGdd: h.rapordakiKumulatifGdd,
    })),
  );

  const haftalar = siraliHaftalar
    .map((hafta, i) => {
      const baslangic = hafta.haftaBaslangic;
      const bitis = new Date(baslangic + "T00:00:00Z");
      bitis.setUTCDate(bitis.getUTCDate() + 6);
      const bitisIso = bitis.toISOString().slice(0, 10);

      const buHaftaKayitlari = musteriKayitlari.filter((r) => r.tarih >= baslangic && r.tarih <= bitisIso);
      const sulamaKayitlari = buHaftaKayitlari.filter((r) => r.recordTypeId === sulamaId);

      return {
        hafta,
        haftalikGdd: hafta.ortSicaklik !== undefined ? haftalikGdd(hafta.ortSicaklik) : undefined,
        kumulatifGdd: kumulatifler[i],
        sulamaSaat: sulamaKayitlari.reduce((sum, r) => sum + (Number(r.values.sure) || 0), 0),
        sulamaGunu: new Set(sulamaKayitlari.map((r) => r.tarih)).size,
        gubreUygulama: buHaftaKayitlari.filter((r) => r.recordTypeId === gubrelemeId).length,
        yaprakGubresi: buHaftaKayitlari.filter((r) => r.recordTypeId === yaprakGubresiId).length,
        ilacUygulama: buHaftaKayitlari.filter((r) => r.recordTypeId === ilaclamaId).length,
        sahaTespiti: buHaftaKayitlari.filter((r) => r.recordTypeId === gozlemId || r.recordTypeId === hastalikId).length,
      };
    })
    .reverse();

  return { customer, haftalar };
}

export async function getIsiToplamiView(customerId: string, user: User) {
  const [allCustomers, allHaftalar, musteriParselleri] = await Promise.all([
    customers.list(),
    isiHaftalari.listByCustomer(customerId),
    parcels.listByCustomer(customerId),
  ]);

  const customer = allCustomers.find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const konumluParselVar = musteriParselleri.some((p) => p.konum);

  const siraliHaftalar = allHaftalar.slice().sort((a, b) => a.haftaBaslangic.localeCompare(b.haftaBaslangic));
  const kumulatifler = kumulatifGddHesapla(
    siraliHaftalar.map((h) => ({
      haftalikGdd: h.ortSicaklik !== undefined ? haftalikGdd(h.ortSicaklik) : undefined,
      rapordakiKumulatifGdd: h.rapordakiKumulatifGdd,
    })),
  );

  const haftalar = siraliHaftalar
    .map((hafta, i) => ({
      hafta,
      haftalikGdd: hafta.ortSicaklik !== undefined ? haftalikGdd(hafta.ortSicaklik) : undefined,
      kumulatifGdd: kumulatifler[i],
    }))
    .reverse();

  return { customer, haftalar, konumluParselVar };
}

export async function getReportsView(user: User) {
  const [allReports, allCustomers] = await Promise.all([reports.list(), customers.list()]);
  const visible = visibleCustomerIds(user, allCustomers);

  return allReports
    .filter((r) => visible.has(r.customerId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => ({ report: r, customer: allCustomers.find((c) => c.id === r.customerId) }));
}

export async function getReportDetail(reportId: string, user: User) {
  const [allReports, allCustomers, allParcels, allRecords, allTypes, allUsers] = await Promise.all([
    reports.list(),
    customers.list(),
    parcels.list(),
    records.list(),
    recordTypes.list(),
    users.list(),
  ]);

  const report = allReports.find((r) => r.id === reportId);
  if (!report) return null;
  const customer = allCustomers.find((c) => c.id === report.customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const engineer = allUsers.find((u) => u.id === customer.sorumluMuhendisId);

  const parcelSections = report.parcelIds.map((parcelId) => {
    const parcel = allParcels.find((p) => p.id === parcelId);
    const parcelRecords = allRecords
      .filter(
        (r) =>
          r.parcelId === parcelId &&
          r.tarih >= report.donemBaslangic &&
          r.tarih <= report.donemBitis,
      )
      .sort((a, b) => a.tarih.localeCompare(b.tarih))
      .map((r) => ({ record: r, type: allTypes.find((t) => t.id === r.recordTypeId) }));
    return { parcel, records: parcelRecords };
  });

  const totalAlan = parcelSections.reduce((sum, s) => sum + (s.parcel?.alanDonum ?? 0), 0);
  const totalKayit = parcelSections.reduce((sum, s) => sum + s.records.length, 0);

  return { report, customer, engineer, parcelSections, totalAlan, totalKayit };
}

function tarihAraligi(baslangic: string, bitis: string): string[] {
  const tarihler: string[] = [];
  const cursor = new Date(baslangic + "T00:00:00Z");
  const son = new Date(bitis + "T00:00:00Z");
  while (cursor <= son) {
    tarihler.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return tarihler;
}

export async function getSulamaRaporuView(
  customerId: string,
  donemBaslangic: string,
  donemBitis: string,
  user: User,
) {
  const [allCustomers, allParcels, allRecords, allTypes, allKuyular] = await Promise.all([
    customers.list(),
    parcels.listByCustomer(customerId),
    records.list(),
    recordTypes.list(),
    sulamaKuyulari.listByCustomer(customerId),
  ]);

  const customer = allCustomers.find((c) => c.id === customerId);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) return null;

  const sulamaType = allTypes.find((t) => t.ad.toLowerCase() === "sulama");
  const tarihler = tarihAraligi(donemBaslangic, donemBitis);
  const kuyuAdi = (kuyuId?: string) => allKuyular.find((k) => k.id === kuyuId)?.ad ?? "Kuyu belirtilmemiş";

  const parcelSatirlari = allParcels
    .slice()
    .sort((a, b) => kuyuAdi(a.sulamaKuyusuId).localeCompare(kuyuAdi(b.sulamaKuyusuId)) || a.ad.localeCompare(b.ad))
    .map((parcel) => {
      const saatler: Record<string, number> = {};
      allRecords
        .filter((r) => r.parcelId === parcel.id && r.recordTypeId === sulamaType?.id)
        .forEach((r) => {
          const saat = Number(r.values.sure);
          if (!Number.isNaN(saat) && tarihler.includes(r.tarih)) {
            saatler[r.tarih] = (saatler[r.tarih] ?? 0) + saat;
          }
        });
      return { parcel, saatler };
    });

  const gruplar = new Map<string, typeof parcelSatirlari>();
  for (const satir of parcelSatirlari) {
    const kuyu = kuyuAdi(satir.parcel.sulamaKuyusuId);
    if (!gruplar.has(kuyu)) gruplar.set(kuyu, []);
    gruplar.get(kuyu)!.push(satir);
  }

  return {
    customer,
    tarihler,
    gruplar: Array.from(gruplar.entries()).map(([kuyu, satirlar]) => ({ kuyu, satirlar })),
  };
}
