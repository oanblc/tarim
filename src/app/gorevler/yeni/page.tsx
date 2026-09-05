import Link from "next/link";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { customers, parcels, users } from "@/lib/repositories";
import { YeniGorevFormu } from "@/components/YeniGorevFormu";
import type { Parcel } from "@/types";

export default async function GorevYeniPage() {
  const user = await requireUser();
  const [allCustomers, allParcels, allUsers] = await Promise.all([customers.list(), parcels.list(), users.list()]);

  const musteriler = allCustomers.filter((c) => canAccessCustomer(user, c.sorumluMuhendisId));
  const musteriIdler = new Set(musteriler.map((m) => m.id));

  const parsellerByMusteri: Record<string, Parcel[]> = {};
  for (const parcel of allParcels) {
    if (!musteriIdler.has(parcel.customerId)) continue;
    (parsellerByMusteri[parcel.customerId] ??= []).push(parcel);
  }

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[600px]">
        <div className="text-[12.5px] text-text-muted mb-1.5">
          <Link href="/gorevler">Görevler</Link>
        </div>
        <div className="text-[21px] font-extrabold mb-[22px]">Yeni Görev Ekle</div>

        <YeniGorevFormu
          musteriler={musteriler}
          parsellerByMusteri={parsellerByMusteri}
          kullanicilar={allUsers}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
