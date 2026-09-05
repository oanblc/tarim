import Link from "next/link";
import { notFound } from "next/navigation";
import { customers } from "@/lib/repositories";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { updateCustomerAction, removeCustomerAction } from "@/lib/actions";

export default async function MusteriDuzenlePage(props: PageProps<"/musteriler/[id]/duzenle">) {
  const { id } = await props.params;
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === id);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) notFound();

  const action = updateCustomerAction.bind(null, id);
  const silAction = removeCustomerAction.bind(null, id);

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[560px]">
        <div className="text-[12.5px] text-text-muted mb-1.5">
          <Link href={`/musteriler/${id}`}>{customer.ad}</Link>
        </div>
        <div className="text-[21px] font-extrabold mb-6">Müşteriyi Düzenle</div>

        <form action={action} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Müşteri / İşletme Adı</div>
            <input
              name="ad"
              required
              defaultValue={customer.ad}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Telefon</div>
            <input
              name="telefon"
              defaultValue={customer.telefon}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">E-posta</div>
            <input
              name="email"
              type="email"
              defaultValue={customer.email}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Adres</div>
            <input
              name="adres"
              defaultValue={customer.adres}
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
          </label>

          <div className="flex gap-2.5 justify-end pt-2">
            <Link
              href={`/musteriler/${id}`}
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
            <div className="text-[13.5px] font-bold text-red">Müşteriyi Sil</div>
            <div className="text-[12px] text-text-secondary mt-0.5">
              Bu müşteriye ait tüm parseller, saha kayıtları, görevler, raporlar, sulama/beslenme planları ve sulama
              kuyuları da silinir. Geri alınamaz.
            </div>
          </div>
          <form action={silAction}>
            <button type="submit" className="px-4 py-2.5 rounded-[10px] border border-red text-red text-[13px] font-bold whitespace-nowrap">
              Müşteriyi Sil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
