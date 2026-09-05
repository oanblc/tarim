import { readCollection, insertOne, updateOne, deleteOne, newId } from "./db";
import type {
  User,
  Customer,
  Parcel,
  RecordTypeDef,
  FieldRecord,
  Report,
  Gorev,
  IsiHaftasi,
  SulamaPlani,
  SulamaKuyusu,
  BeslenmePlani,
  BeslenmeUygulamaKaydi,
  FertigasyonKaydi,
} from "@/types";

const COLLECTIONS = {
  users: "users",
  customers: "customers",
  parcels: "parcels",
  recordTypes: "record-types",
  records: "records",
  reports: "reports",
  gorevler: "gorevler",
  isiHaftalari: "isi-haftalari",
  sulamaPlanlari: "sulama-planlari",
  sulamaKuyulari: "sulama-kuyulari",
  beslenmePlanlari: "beslenme-planlari",
  beslenmeUygulamalari: "beslenme-uygulamalari",
  fertigasyonKayitlari: "fertigasyon-kayitlari",
} as const;

export const users = {
  list: () => readCollection<User>(COLLECTIONS.users),
  create: (data: Omit<User, "id" | "createdAt">) =>
    insertOne<User>(COLLECTIONS.users, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<User>) => updateOne<User>(COLLECTIONS.users, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.users, id),
};

export const customers = {
  list: () => readCollection<Customer>(COLLECTIONS.customers),
  create: (data: Omit<Customer, "id" | "createdAt">) =>
    insertOne<Customer>(COLLECTIONS.customers, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<Customer>) => updateOne<Customer>(COLLECTIONS.customers, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.customers, id),
};

export const parcels = {
  list: () => readCollection<Parcel>(COLLECTIONS.parcels),
  listByCustomer: async (customerId: string) =>
    (await readCollection<Parcel>(COLLECTIONS.parcels)).filter((p) => p.customerId === customerId),
  create: (data: Omit<Parcel, "id" | "createdAt">) =>
    insertOne<Parcel>(COLLECTIONS.parcels, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<Parcel>) => updateOne<Parcel>(COLLECTIONS.parcels, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.parcels, id),
};

export const recordTypes = {
  list: () => readCollection<RecordTypeDef>(COLLECTIONS.recordTypes),
  create: (data: Omit<RecordTypeDef, "id">) =>
    insertOne<RecordTypeDef>(COLLECTIONS.recordTypes, { ...data, id: newId() }),
  update: (id: string, patch: Partial<RecordTypeDef>) =>
    updateOne<RecordTypeDef>(COLLECTIONS.recordTypes, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.recordTypes, id),
};

export const records = {
  list: () => readCollection<FieldRecord>(COLLECTIONS.records),
  listByParcel: async (parcelId: string) =>
    (await readCollection<FieldRecord>(COLLECTIONS.records)).filter((r) => r.parcelId === parcelId),
  create: (data: Omit<FieldRecord, "id" | "createdAt">) =>
    insertOne<FieldRecord>(COLLECTIONS.records, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<FieldRecord>) => updateOne<FieldRecord>(COLLECTIONS.records, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.records, id),
};

export const reports = {
  list: () => readCollection<Report>(COLLECTIONS.reports),
  listByCustomer: async (customerId: string) =>
    (await readCollection<Report>(COLLECTIONS.reports)).filter((r) => r.customerId === customerId),
  create: (data: Omit<Report, "id" | "createdAt">) =>
    insertOne<Report>(COLLECTIONS.reports, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<Report>) => updateOne<Report>(COLLECTIONS.reports, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.reports, id),
};

export const gorevler = {
  list: () => readCollection<Gorev>(COLLECTIONS.gorevler),
  listByParcel: async (parcelId: string) =>
    (await readCollection<Gorev>(COLLECTIONS.gorevler)).filter((g) => g.parcelId === parcelId),
  create: (data: Omit<Gorev, "id" | "createdAt">) =>
    insertOne<Gorev>(COLLECTIONS.gorevler, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<Gorev>) => updateOne<Gorev>(COLLECTIONS.gorevler, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.gorevler, id),
};

export const isiHaftalari = {
  list: () => readCollection<IsiHaftasi>(COLLECTIONS.isiHaftalari),
  listByCustomer: async (customerId: string) =>
    (await readCollection<IsiHaftasi>(COLLECTIONS.isiHaftalari)).filter((h) => h.customerId === customerId),
  create: (data: Omit<IsiHaftasi, "id" | "createdAt">) =>
    insertOne<IsiHaftasi>(COLLECTIONS.isiHaftalari, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<IsiHaftasi>) => updateOne<IsiHaftasi>(COLLECTIONS.isiHaftalari, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.isiHaftalari, id),
};

export const sulamaPlanlari = {
  list: () => readCollection<SulamaPlani>(COLLECTIONS.sulamaPlanlari),
  listByParcel: async (parcelId: string) =>
    (await readCollection<SulamaPlani>(COLLECTIONS.sulamaPlanlari)).filter((p) => p.parcelId === parcelId),
  create: (data: Omit<SulamaPlani, "id" | "createdAt">) =>
    insertOne<SulamaPlani>(COLLECTIONS.sulamaPlanlari, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<SulamaPlani>) => updateOne<SulamaPlani>(COLLECTIONS.sulamaPlanlari, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.sulamaPlanlari, id),
};

export const sulamaKuyulari = {
  list: () => readCollection<SulamaKuyusu>(COLLECTIONS.sulamaKuyulari),
  listByCustomer: async (customerId: string) =>
    (await readCollection<SulamaKuyusu>(COLLECTIONS.sulamaKuyulari)).filter((k) => k.customerId === customerId),
  create: (data: Omit<SulamaKuyusu, "id" | "createdAt">) =>
    insertOne<SulamaKuyusu>(COLLECTIONS.sulamaKuyulari, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<SulamaKuyusu>) => updateOne<SulamaKuyusu>(COLLECTIONS.sulamaKuyulari, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.sulamaKuyulari, id),
};

export const beslenmePlanlari = {
  list: () => readCollection<BeslenmePlani>(COLLECTIONS.beslenmePlanlari),
  listByParcel: async (parcelId: string) =>
    (await readCollection<BeslenmePlani>(COLLECTIONS.beslenmePlanlari)).filter((p) => p.parcelId === parcelId),
  create: (data: Omit<BeslenmePlani, "id" | "createdAt">) =>
    insertOne<BeslenmePlani>(COLLECTIONS.beslenmePlanlari, { ...data, id: newId(), createdAt: new Date().toISOString() }),
  update: (id: string, patch: Partial<BeslenmePlani>) =>
    updateOne<BeslenmePlani>(COLLECTIONS.beslenmePlanlari, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.beslenmePlanlari, id),
};

export const beslenmeUygulamalari = {
  list: () => readCollection<BeslenmeUygulamaKaydi>(COLLECTIONS.beslenmeUygulamalari),
  listByPlan: async (planId: string) =>
    (await readCollection<BeslenmeUygulamaKaydi>(COLLECTIONS.beslenmeUygulamalari)).filter((u) => u.planId === planId),
  create: (data: Omit<BeslenmeUygulamaKaydi, "id" | "createdAt">) =>
    insertOne<BeslenmeUygulamaKaydi>(COLLECTIONS.beslenmeUygulamalari, {
      ...data,
      id: newId(),
      createdAt: new Date().toISOString(),
    }),
  update: (id: string, patch: Partial<BeslenmeUygulamaKaydi>) =>
    updateOne<BeslenmeUygulamaKaydi>(COLLECTIONS.beslenmeUygulamalari, id, patch),
  remove: (id: string) => deleteOne(COLLECTIONS.beslenmeUygulamalari, id),
};

export const fertigasyonKayitlari = {
  list: () => readCollection<FertigasyonKaydi>(COLLECTIONS.fertigasyonKayitlari),
  listByParcel: async (parcelId: string) =>
    (await readCollection<FertigasyonKaydi>(COLLECTIONS.fertigasyonKayitlari)).filter((k) => k.parcelId === parcelId),
  create: (data: Omit<FertigasyonKaydi, "id" | "createdAt">) =>
    insertOne<FertigasyonKaydi>(COLLECTIONS.fertigasyonKayitlari, {
      ...data,
      id: newId(),
      createdAt: new Date().toISOString(),
    }),
  remove: (id: string) => deleteOne(COLLECTIONS.fertigasyonKayitlari, id),
};

