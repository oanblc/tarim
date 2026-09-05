import Link from "next/link";
import { notFound } from "next/navigation";
import { parcels, customers, records, recordTypes } from "@/lib/repositories";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { updateRecordAction, removeRecordAction } from "@/lib/actions";

export default async function KayitDuzenlePage(props: PageProps<"/parseller/[id]/kayit/[recordId]/duzenle">) {
  const { id, recordId } = await props.params;
  const user = await requireUser();
  const [parcel, allCustomers, allRecords, types] = await Promise.all([
    parcels.list().then((all) => all.find((p) => p.id === id)),
    customers.list(),
    records.listByParcel(id),
    recordTypes.list(),
  ]);
  const owningCustomer = parcel && allCustomers.find((c) => c.id === parcel.customerId);
  if (!parcel || !owningCustomer || !canAccessCustomer(user, owningCustomer.sorumluMuhendisId)) notFound();

  const record = allRecords.find((r) => r.id === recordId);
  if (!record) notFound();
  const type = types.find((t) => t.id === record.recordTypeId);

  const action = updateRecordAction.bind(null, recordId);
  const silAction = removeRecordAction.bind(null, recordId);

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[680px]">
        <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-1.5">
          <Link href={`/parseller/${parcel.id}`}>{parcel.ad}</Link>
          <span>/</span>
          <span className="text-text font-bold">Kaydı Düzenle</span>
        </div>
        <div className="text-[21px] font-extrabold mb-[22px]">{type?.ad ?? "Kayıt"} Düzenle</div>

        <div className="bg-white border border-border rounded-2xl p-7">
          <form action={action} className="flex flex-col gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Tarih</div>
              <input
                name="tarih"
                type="date"
                required
                defaultValue={record.tarih}
                className="border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </label>

            {type && type.fields.length > 0 && (
              <div className="border-t border-border-soft pt-4 grid grid-cols-2 gap-4">
                {type.fields.map((field) => {
                  const mevcut = record.values[field.key];
                  return (
                    <label key={field.key} className={field.type === "textarea" ? "col-span-2 block" : "block"}>
                      <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">{field.label}</div>
                      {field.type === "select" ? (
                        <select
                          name={`field:${field.key}`}
                          required={field.required}
                          defaultValue={mevcut !== undefined ? String(mevcut) : ""}
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
                          defaultValue={mevcut !== undefined ? String(mevcut) : ""}
                          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
                        />
                      ) : (
                        <input
                          name={`field:${field.key}`}
                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                          required={field.required}
                          defaultValue={mevcut !== undefined ? String(mevcut) : ""}
                          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Not (opsiyonel)</div>
              <textarea
                name="not"
                rows={3}
                defaultValue={record.not}
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
                Kaydet
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-red/30 rounded-2xl p-6 mt-5 flex items-center justify-between">
          <div className="text-[13.5px] font-bold text-red">Kaydı Sil</div>
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
