import Link from "next/link";
import { notFound } from "next/navigation";
import { customers, sulamaKuyulari } from "@/lib/repositories";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { createParcelAction } from "@/lib/actions";

export default async function ParselEklePage(props: PageProps<"/musteriler/[id]/parsel-ekle">) {
  const { id } = await props.params;
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === id);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) notFound();
  const kuyular = await sulamaKuyulari.listByCustomer(id);

  const action = createParcelAction.bind(null, id);

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[560px]">
        <div className="text-[12.5px] text-text-muted mb-2">{customer.ad}</div>
        <div className="text-[21px] font-extrabold mb-6">Parsel Ekle</div>

        <form action={action} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Parsel Adı</div>
            <input
              name="ad"
              required
              placeholder="Örn. Parsel 1 – Kuzey Tarla"
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ekili Ürün</div>
              <input
                name="urun"
                required
                placeholder="Örn. Mısır"
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
                placeholder="Örn. 2800"
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ekim Düzeni (opsiyonel)</div>
              <input
                name="ekimDuzeni"
                placeholder="Örn. 7 x 2,5 m"
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sulama Kuyusu / Vana Grubu (opsiyonel)</div>
            <select
              name="sulamaKuyusuId"
              defaultValue=""
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
            >
              <option value="">Belirtilmemiş</option>
              {kuyular.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ad}
                </option>
              ))}
            </select>
            <div className="text-[11.5px] text-text-muted mt-1.5">
              Aynı kuyudan sulanan parselleri aynı kuyuya atarsan Sulama Raporu&apos;nda birlikte gruplanır.{" "}
              <Link href={`/musteriler/${id}/sulama-kuyulari`} className="text-primary font-semibold">
                Yeni kuyu ekle
              </Link>
            </div>
          </label>

          <div className="flex justify-end pt-2">
            <button type="submit" className="px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
              Parseli Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
