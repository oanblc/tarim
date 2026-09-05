import Link from "next/link";
import { parcels, customers } from "@/lib/repositories";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { MapIcon } from "@/components/icons";
import { SayfaBasligi } from "@/components/SayfaBasligi";

export default async function ParsellerPage() {
  const user = await requireUser();
  const [rawParcels, allCustomers] = await Promise.all([parcels.list(), customers.list()]);
  const visibleParcels = rawParcels.filter((p) => {
    const customer = allCustomers.find((c) => c.id === p.customerId);
    return customer && canAccessCustomer(user, customer.sorumluMuhendisId);
  });

  return (
    <div className="p-8 lg:p-10">
      <SayfaBasligi icon={MapIcon} title="Parseller" subtitle={`Erişiminizdeki ${visibleParcels.length} parsel`} />

      {visibleParcels.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Henüz parsel eklenmedi.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleParcels.map((parcel) => {
            const customer = allCustomers.find((c) => c.id === parcel.customerId);
            return (
              <Link
                key={parcel.id}
                href={`/parseller/${parcel.id}`}
                className="bg-white border border-border rounded-2xl p-[18px] hover:border-primary"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-bold">{parcel.ad}</span>
                  <span className="text-xs text-text-secondary font-semibold">{parcel.alanDonum} dönüm</span>
                </div>
                <div className="text-xs text-text-secondary">{parcel.urun}</div>
                <div className="text-xs text-text-muted mt-2">{customer?.ad}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
