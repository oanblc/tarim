import Link from "next/link";
import { notFound } from "next/navigation";
import { parcels, customers, gorevler, users } from "@/lib/repositories";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { updateGorevAction, removeGorevAction } from "@/lib/actions";

const KONULAR = ["Genel", "Gübreleme", "Sulama", "Toprak", "Budama", "Yabancı Ot", "Hastalık / Zararlı"];

export default async function GorevDuzenlePage(props: PageProps<"/parseller/[id]/gorev/[gorevId]/duzenle">) {
  const { id, gorevId } = await props.params;
  const user = await requireUser();
  const parcel = (await parcels.list()).find((p) => p.id === id);
  const customer = parcel && (await customers.list()).find((c) => c.id === parcel.customerId);
  if (!parcel || !customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) notFound();
  const gorev = (await gorevler.listByParcel(id)).find((g) => g.id === gorevId);
  if (!gorev) notFound();
  const kullanicilar = await users.list();

  const action = updateGorevAction.bind(null, gorevId, parcel.id);
  const silAction = removeGorevAction.bind(null, gorevId, parcel.id);

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[600px]">
        <div className="text-[12.5px] text-text-muted mb-1.5">{parcel.ad}</div>
        <div className="text-[21px] font-extrabold mb-[22px]">Görevi Düzenle</div>

        <form action={action} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Konu</div>
              <select
                name="konu"
                defaultValue={gorev.konu}
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
                defaultValue={gorev.tarih}
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
              defaultValue={gorev.gozlem}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Önerilen / Yapılan Uygulama (opsiyonel)</div>
            <textarea
              name="onerilenUygulama"
              rows={2}
              defaultValue={gorev.onerilenUygulama}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Termin Tarihi (opsiyonel)</div>
            <input
              name="terminTarihi"
              type="date"
              defaultValue={gorev.terminTarihi}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Not (opsiyonel)</div>
            <textarea
              name="not"
              rows={2}
              defaultValue={gorev.not}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sorumlu</div>
            <select
              name="sorumluId"
              defaultValue={gorev.sorumluId ?? user.id}
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

          <div className="text-[11.5px] text-text-muted -mt-1.5">
            Durum, parsel sayfasındaki görev kartından ayrıca güncellenir.
          </div>

          <div className="flex gap-2.5 justify-end pt-2">
            <Link
              href={`/parseller/${parcel.id}?sekme=gorevler`}
              className="px-5 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
            >
              Vazgeç
            </Link>
            <button type="submit" className="px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
              Kaydet
            </button>
          </div>
        </form>

        <div className="bg-white border border-red/30 rounded-2xl p-6 mt-5 flex items-center justify-between">
          <div className="text-[13.5px] font-bold text-red">Görevi Sil</div>
          <form action={silAction}>
            <button type="submit" className="px-4 py-2.5 rounded-[10px] border border-red text-red text-[13px] font-bold">
              Sil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
