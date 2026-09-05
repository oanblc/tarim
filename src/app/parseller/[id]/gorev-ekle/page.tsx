import Link from "next/link";
import { notFound } from "next/navigation";
import { parcels, users } from "@/lib/repositories";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { customers } from "@/lib/repositories";
import { createGorevAction } from "@/lib/actions";

const KONULAR = ["Genel", "Gübreleme", "Sulama", "Toprak", "Budama", "Yabancı Ot", "Hastalık / Zararlı"];

export default async function GorevEklePage(props: PageProps<"/parseller/[id]/gorev-ekle">) {
  const { id } = await props.params;
  const user = await requireUser();
  const parcel = (await parcels.list()).find((p) => p.id === id);
  const customer = parcel && (await customers.list()).find((c) => c.id === parcel.customerId);
  if (!parcel || !customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) notFound();
  const kullanicilar = await users.list();

  const action = createGorevAction.bind(null, parcel.id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[600px]">
        <div className="text-[12.5px] text-text-muted mb-1.5">{parcel.ad}</div>
        <div className="text-[21px] font-extrabold mb-[22px]">Yeni Görev Ekle</div>

        <form action={action} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Konu</div>
              <select
                name="konu"
                defaultValue={KONULAR[0]}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
              >
                {KONULAR.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Tespit Tarihi</div>
              <input
                name="tarih"
                type="date"
                required
                defaultValue={today}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Gözlem / Tespit</div>
            <textarea
              name="gozlem"
              required
              rows={3}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Önerilen / Yapılan Uygulama (opsiyonel)</div>
            <textarea
              name="onerilenUygulama"
              rows={2}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Termin Tarihi (opsiyonel)</div>
              <input
                name="terminTarihi"
                type="date"
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Durum</div>
              <select
                name="durum"
                defaultValue="planlandi"
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
              >
                <option value="planlandi">Planlandı</option>
                <option value="devam_ediyor">Devam Ediyor</option>
                <option value="takip_ediliyor">Takip Ediliyor</option>
                <option value="bekliyor">Bekliyor</option>
                <option value="kritik">Kritik Risk / Gecikme</option>
                <option value="acil">Acil</option>
                <option value="toplanti_gerekli">Toplantı Gerekli</option>
                <option value="tamamlandi">Tamamlandı</option>
              </select>
            </label>
          </div>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sorumlu</div>
            <select
              name="sorumluId"
              defaultValue={user.id}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
            >
              {kullanicilar.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad}
                  {k.id === user.id ? " (ben)" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2.5 justify-end pt-2">
            <Link
              href={`/parseller/${parcel.id}`}
              className="px-5 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
            >
              Vazgeç
            </Link>
            <button type="submit" className="px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
              Görevi Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
