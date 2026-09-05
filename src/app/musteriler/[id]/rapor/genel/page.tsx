import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { createReportDraftAction } from "@/lib/actions";
import { CheckIcon } from "@/components/icons";
import { SelectAllToggle } from "@/components/SelectAllToggle";

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default async function RaporOlusturPage(props: PageProps<"/musteriler/[id]/rapor/genel">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getCustomerDetail(id, user);
  if (!detail) notFound();
  const { customer, parcels } = detail;

  const action = createReportDraftAction.bind(null, customer.id);

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[620px]">
        <div className="text-[12.5px] text-text-muted mb-1.5">
          <Link href={`/musteriler/${customer.id}/rapor`}>{customer.ad}</Link>
        </div>
        <div className="text-[21px] font-extrabold mb-[22px]">Genel Rapor Oluştur</div>

        <form action={action} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Dönem Başlangıç</div>
              <input
                name="donemBaslangic"
                type="date"
                required
                defaultValue={isoMonthStart()}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Dönem Bitiş</div>
              <input
                name="donemBitis"
                type="date"
                required
                defaultValue={isoToday()}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-primary"
              />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[12.5px] font-bold text-[#4A4F45]">Parseller</div>
              {parcels.length > 1 && <SelectAllToggle name="parcelIds" />}
            </div>
            {parcels.length === 0 ? (
              <div className="text-sm text-text-secondary">Bu müşteriye ait parsel yok.</div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                {parcels.map(({ parcel }) => (
                  <label
                    key={parcel.id}
                    className="flex items-center gap-2.5 bg-cream border border-border rounded-[9px] px-3.5 py-2.5 cursor-pointer has-checked:border-primary has-checked:bg-primary-bg"
                  >
                    <input type="checkbox" name="parcelIds" value={parcel.id} defaultChecked className="peer sr-only" />
                    <span className="w-[17px] h-[17px] rounded-[5px] border border-border flex items-center justify-center bg-white peer-checked:bg-primary peer-checked:border-primary">
                      <CheckIcon size={11} className="text-cream" />
                    </span>
                    <span className="text-[13px] font-semibold flex-1">{parcel.ad}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Mühendis Notu (rapora eklenir)</div>
            <textarea
              name="ozet"
              rows={4}
              placeholder="Bu dönemde gözlemlenen genel durum, öneriler..."
              className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
            />
          </label>

          <div className="flex justify-end pt-1">
            <button type="submit" className="px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
              Taslağı Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
