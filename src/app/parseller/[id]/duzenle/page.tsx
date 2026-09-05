import Link from "next/link";
import { notFound } from "next/navigation";
import { getParcelDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { sulamaKuyulari } from "@/lib/repositories";
import { updateParcelAction, removeParcelAction } from "@/lib/actions";

export default async function ParselDuzenlePage(props: PageProps<"/parseller/[id]/duzenle">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getParcelDetail(id, user);
  if (!detail) notFound();
  const { parcel, customer } = detail;
  const kuyular = customer ? await sulamaKuyulari.listByCustomer(customer.id) : [];

  const action = updateParcelAction.bind(null, parcel.id);
  const silAction = removeParcelAction.bind(null, parcel.id);

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[560px]">
        <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-1.5">
          <Link href={`/parseller/${parcel.id}`}>{parcel.ad}</Link>
          <span>/</span>
          <span className="text-text font-bold">Düzenle</span>
        </div>
        <div className="text-[21px] font-extrabold mb-6">Parseli Düzenle</div>

        <form action={action} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Parsel Adı</div>
            <input
              name="ad"
              required
              defaultValue={parcel.ad}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ekili Ürün</div>
              <input
                name="urun"
                required
                defaultValue={parcel.urun}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Alan (dönüm)</div>
              <input
                name="alanDonum"
                type="number"
                step="0.1"
                required
                defaultValue={parcel.alanDonum}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ağaç Sayısı (opsiyonel)</div>
              <input
                name="agacSayisi"
                type="number"
                step="1"
                min={0}
                defaultValue={parcel.agacSayisi}
                placeholder="Örn. 2800"
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ekim Düzeni (opsiyonel)</div>
              <input
                name="ekimDuzeni"
                defaultValue={parcel.ekimDuzeni}
                placeholder="Örn. 7 x 2,5 m"
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sulama Kuyusu / Vana Grubu</div>
            <select
              name="sulamaKuyusuId"
              defaultValue={parcel.sulamaKuyusuId ?? ""}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
            >
              <option value="">Belirtilmemiş</option>
              {kuyular.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad}
                </option>
              ))}
            </select>
            {customer && (
              <div className="text-[11.5px] text-text-muted mt-1.5">
                <Link href={`/musteriler/${customer.id}/sulama-kuyulari`} className="text-primary font-semibold">
                  Kuyuları yönet
                </Link>
              </div>
            )}
          </label>

          <div className="flex justify-end gap-2.5 pt-2">
            <Link
              href={`/parseller/${parcel.id}`}
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
          <div>
            <div className="text-[13.5px] font-bold text-red">Parseli Sil</div>
            <div className="text-[12px] text-text-secondary mt-0.5">
              Bu parsele bağlı tüm saha kayıtları, görevler, sulama ve beslenme planları da silinir. Geri alınamaz.
            </div>
          </div>
          <form action={silAction}>
            <button type="submit" className="px-4 py-2.5 rounded-[10px] border border-red text-red text-[13px] font-bold whitespace-nowrap">
              Parseli Sil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
