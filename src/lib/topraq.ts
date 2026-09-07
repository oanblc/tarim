// agro.topraq.ai müşteri panelinden hava istasyonu (sıcaklık/bağıl nem) ve
// toprak nem sensörü (kök bölgesi nem indeksi) verisini çeken entegrasyon.
// Resmi/açık bir API değil — topraq.ai web arayüzünün kullandığı dahili API,
// sadece bu hesabın (TOPRAQ_USERNAME) erişebildiği çiftlikleri okur.
// Kalıcı depolama yok: sayfa her açıldığında canlı çekilir (bkz. src/app/toprak).

const BASE_URL = "https://agro.topraq.ai/api/v33/";
const HEADERS_BASE = {
  "Content-Type": "application/json",
  "X-APP-NAME": "customer",
  "X-APP-ENV": "production",
  Accept: "application/json",
  "x-version": "1.0",
};

type TopraqSession = { access_token: string; refresh_token: string; token_type: string };

export type TopraqCustomer = { id: number; full_name: string };

export type TopraqIstasyon = {
  deviceId: number;
  label: string;
  fieldId: number;
  fieldName: string;
  sicaklik?: number;
  bagilNem?: number;
  sonGuncelleme?: string;
};

export type TopraqNemSensoru = {
  deviceId: number;
  label: string;
  fieldId?: number;
  fieldName?: string;
  deger?: number;
  degerMetni?: string;
  sonGuncelleme?: string;
};

export type TopraqOverview = {
  istasyonlar: TopraqIstasyon[];
  nemSensorleri: TopraqNemSensoru[];
};

// Kök oturum (customer seçilmeden önceki) — çiftlik listesini almak için.
let rootSession: TopraqSession | null = null;
// Her çiftlik (customer id) için ayrı token — account/change-customer, cid'i
// token içine gömüyor, bu yüzden çiftlik başına ayrı bir oturum lazım.
const customerSessions = new Map<number, TopraqSession>();

async function apiPost(path: string, session: TopraqSession | null, body: unknown, params?: Record<string, string | number>) {
  const url = new URL(BASE_URL + path);
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, {
    method: "POST",
    headers: session ? { ...HEADERS_BASE, Authorization: `${session.token_type} ${session.access_token}` } : HEADERS_BASE,
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`topraq POST ${path} -> ${res.status}`);
  return res.json();
}

async function apiGet(path: string, session: TopraqSession) {
  const res = await fetch(BASE_URL + path, {
    headers: { ...HEADERS_BASE, Authorization: `${session.token_type} ${session.access_token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`topraq GET ${path} -> ${res.status}`);
  return res.json();
}

function credentials() {
  const user_name = process.env.TOPRAQ_USERNAME;
  const password = process.env.TOPRAQ_PASSWORD;
  if (!user_name || !password) return null;
  return { user_name, password };
}

async function login(): Promise<TopraqSession> {
  const creds = credentials();
  if (!creds) throw new Error("TOPRAQ_USERNAME / TOPRAQ_PASSWORD tanımlı değil.");
  const body = await apiPost("account/token", null, { ...creds, remember: false, grant_type: "access_token" });
  if (!body?.data?.access_token) throw new Error("Topraq girişi başarısız.");
  rootSession = body.data;
  return body.data;
}

async function getRootSession(): Promise<TopraqSession> {
  if (rootSession) return rootSession;
  return login();
}

async function switchCustomer(customerId: number): Promise<TopraqSession> {
  const cached = customerSessions.get(customerId);
  if (cached) return cached;
  const root = await getRootSession();
  const body = await apiPost("account/change-customer", root, { customer: customerId });
  if (!body?.data?.access_token) throw new Error("Çiftlik seçilemedi.");
  customerSessions.set(customerId, body.data);
  return body.data;
}

export async function topraqCiftlikleriGetir(): Promise<TopraqCustomer[]> {
  const session = await getRootSession();
  const body = await apiGet("account/change-customer", session);
  return body?.view?.select_lists?.customers ?? [];
}

// Tarla (field) -> cihaz envanteri: hangi cihaz hangi tarlada, konumu ne.
async function deviceEnvanteri(session: TopraqSession) {
  const body = await apiGet("agro-map/data?base_href=/customer/", session);
  const devices = (body?.data?.data?.devices ?? []) as Array<{
    id: number;
    type: string;
    label: string;
    field?: { id: number; name: string };
    last_data_at_f?: string;
  }>;
  return devices;
}

async function haftaIstasyonVerisi(session: TopraqSession, fieldId: number): Promise<TopraqIstasyon[]> {
  const criteria = (await apiPost("report/weather/criterias", session, { field_id: fieldId }))?.data;
  if (!criteria) return [];
  const data = (await apiPost("report/weather/data", session, criteria))?.data as
    | Array<{ field: { id: number; name: string }; device: { id: number; label: string }; data: Array<{ title?: string; series: Array<{ title: string; data: Array<{ x_f: string; y: number }> }> }> }>
    | undefined;
  if (!data) return [];

  // Aynı cihaz (device_id) API yanıtında birden fazla kez geçebiliyor —
  // her metrik grubu (Sıcaklık&Radyasyon, Bağıl Nem&Yağış ...) ayrı bir
  // "entry" olarak dönüyor ve bazı gruplar sıcaklığı tekrar içeriyor.
  // Bu yüzden cihaz bazında birleştiriyoruz (aksi halde tekrarlanan satır
  // / React key çakışması olur).
  const cihazBazinda = new Map<number, TopraqIstasyon>();
  for (const entry of data) {
    const mevcut = cihazBazinda.get(entry.device.id) ?? {
      deviceId: entry.device.id,
      label: entry.device.label,
      fieldId: entry.field.id,
      fieldName: entry.field.name,
    };
    for (const grup of entry.data ?? []) {
      for (const seri of grup.series ?? []) {
        const son = seri.data?.[seri.data.length - 1];
        if (!son) continue;
        if (seri.title === "Hava Sıcaklığı") mevcut.sicaklik = son.y;
        if (seri.title === "Bağıl Nem") mevcut.bagilNem = son.y;
        if (son.x_f) mevcut.sonGuncelleme = son.x_f;
      }
    }
    cihazBazinda.set(entry.device.id, mevcut);
  }
  return Array.from(cihazBazinda.values()).filter((i) => i.sicaklik !== undefined || i.bagilNem !== undefined);
}

export async function getTopraqOverview(customerId: number): Promise<TopraqOverview> {
  const session = await switchCustomer(customerId);
  const [devices, moisture] = await Promise.all([
    deviceEnvanteri(session),
    apiGet("agro-map/measurement/0/data", session).then((b) => b?.data ?? []),
  ]);

  const deviceById = new Map(devices.map((d) => [d.id, d]));

  // Hava istasyonu bulunan tarlaları tekilleştir (bir tarlada birden fazla
  // istasyon olabilir, report/weather/data zaten hepsini tek çağrıda döner).
  const istasyonluAlanlar = new Set(devices.filter((d) => d.type === "weather").map((d) => d.field?.id).filter((id): id is number => id !== undefined));

  const istasyonSonuclari = await Promise.all(
    Array.from(istasyonluAlanlar).map((fieldId) => haftaIstasyonVerisi(session, fieldId).catch(() => [])),
  );
  const istasyonlar = istasyonSonuclari.flat().sort((a, b) => a.fieldName.localeCompare(b.fieldName, "tr"));

  type MoistureRow = { device_id: number; value: number | null; value_f?: string; data_at_f?: string };
  const nemSensorleri: TopraqNemSensoru[] = (moisture as MoistureRow[])
    .map((m) => {
      const cihaz = deviceById.get(m.device_id);
      return {
        deviceId: m.device_id,
        label: cihaz?.label ?? `Cihaz #${m.device_id}`,
        fieldId: cihaz?.field?.id,
        fieldName: cihaz?.field?.name,
        deger: m.value ?? undefined,
        degerMetni: m.value_f?.replace(/<[^>]+>/g, "").trim(),
        sonGuncelleme: m.data_at_f,
      };
    })
    .sort((a, b) => {
      // veri olanlar önce
      if ((a.deger !== undefined) !== (b.deger !== undefined)) return a.deger !== undefined ? -1 : 1;
      return (a.fieldName ?? "").localeCompare(b.fieldName ?? "", "tr");
    });

  return { istasyonlar, nemSensorleri };
}
