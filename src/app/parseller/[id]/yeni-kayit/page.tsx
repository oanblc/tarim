import Link from "next/link";
import { notFound } from "next/navigation";
import { parcels, customers, recordTypes } from "@/lib/repositories";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { createRecordAction } from "@/lib/actions";
import { RECORD_TYPE_ICONS } from "@/components/icons";

export default async function YeniKayitPage(props: PageProps<"/parseller/[id]/yeni-kayit">) {
  const { id } = await props.params;
  const user = await requireUser();
  const [parcel, types, allCustomers] = await Promise.all([
    parcels.list().then((all) => all.find((p) => p.id === id)),
    recordTypes.list(),
    customers.list(),
  ]);
  const owningCustomer = parcel && allCustomers.find((c) => c.id === parcel.customerId);
  if (!parcel || !owningCustomer || !canAccessCustomer(user, owningCustomer.sorumluMuhendisId)) notFound();

  const searchParams = await props.searchParams;
  const selectedTypeId = String(searchParams.tip ?? types[0]?.id ?? "");
  const selectedType = types.find((t) => t.id === selectedTypeId) ?? types[0];

  const action = createRecordAction.bind(null, parcel.id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[680px]">
        <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-1.5">
          <Link href={`/parseller/${parcel.id}`}>{parcel.ad}</Link>
          <span>/</span>
          <span className="text-text font-bold">Yeni Saha Kaydı</span>
        </div>
        <div className="text-[21px] font-extrabold mb-[22px]">Yeni Saha Kaydı</div>

        <div className="bg-white border border-border rounded-2xl p-7">
          <div className="mb-5">
            <div className="text-[12.5px] font-bold text-[#4A4F45] mb-2">Kayıt Tipi</div>
            <div className="flex gap-2 flex-wrap">
              {types.map((t) => {
                const Icon = RECORD_TYPE_ICONS(t.ad);
                const active = t.id === selectedType?.id;
                return (
                  <Link
                    key={t.id}
                    href={`/parseller/${parcel.id}/yeni-kayit?tip=${t.id}`}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold ${
                      active ? "bg-primary text-cream" : "bg-cream border border-border text-[#4A4F45]"
                    }`}
                  >
                    <Icon size={15} className={active ? "text-cream" : "text-[#4A4F45]"} />
                    {t.ad}
                  </Link>
                );
              })}
            </div>
          </div>

          <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="recordTypeId" value={selectedType?.id ?? ""} />

            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Tarih</div>
              <input
                name="tarih"
                type="date"
                required
                defaultValue={today}
                className="border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>

            {selectedType && selectedType.fields.length > 0 && (
              <div className="border-t border-border-soft pt-4 grid grid-cols-2 gap-4">
                {selectedType.fields.map((field) => (
                  <label key={field.key} className={field.type === "textarea" ? "col-span-2 block" : "block"}>
                    <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">{field.label}</div>
                    {field.type === "select" ? (
                      <select
                        name={`field:${field.key}`}
                        required={field.required}
                        defaultValue=""
                        className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary bg-white"
                      >
                        <option value="" disabled>
                          Seçin
                        </option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={`field:${field.key}`}
                        required={field.required}
                        rows={3}
                        className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
                      />
                    ) : (
                      <input
                        name={`field:${field.key}`}
                        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        required={field.required}
                        className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
                      />
                    )}
                  </label>
                ))}
              </div>
            )}

            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Not (opsiyonel)</div>
              <textarea
                name="not"
                rows={3}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>

            <div className="flex gap-2.5 justify-end pt-2">
              <Link
                href={`/parseller/${parcel.id}`}
                className="px-5 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
              >
                Vazgeç
              </Link>
              <button type="submit" className="px-[22px] py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
                Kaydı Ekle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
