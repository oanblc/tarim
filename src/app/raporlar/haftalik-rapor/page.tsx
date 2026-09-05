import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getCustomersView } from "@/lib/queries";
import { parcels as parcelsRepo, records as recordsRepo, recordTypes as recordTypesRepo } from "@/lib/repositories";
import { HaftalikRaporForm } from "./HaftalikRaporForm";

export default async function HaftalikRaporPage(props: PageProps<"/raporlar/haftalik-rapor">) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const musteriId = typeof searchParams.musteriId === "string" ? searchParams.musteriId : "";

  const musteriler = await getCustomersView(user);
  const secilenParseller = musteriId ? await parcelsRepo.listByCustomer(musteriId) : [];

  const tumKayitlar = musteriId ? await recordsRepo.list() : [];
  const tumTipler = musteriId ? await recordTypesRepo.list() : [];
  const parselIdSeti = new Set(secilenParseller.map((p) => p.id));
  const kayitlar = tumKayitlar
    .filter((r) => parselIdSeti.has(r.parcelId))
    .map((r) => ({
      id: r.id,
      parcelId: r.parcelId,
      tarih: r.tarih,
      donemBitis: r.donemBitis,
      typeAd: tumTipler.find((t) => t.id === r.recordTypeId)?.ad ?? "Kayıt",
      values: r.values as Record<string, string | number>,
      not: r.not,
      fenolojikDonem: r.fenolojikDonem,
      durum: r.durum,
    }));

  return (
    <div className="p-8 lg:p-10">
      <div className="max-w-[980px]">
        <div className="text-[12.5px] text-text-muted mb-1.5">
          <Link href="/raporlar">Raporlar</Link>
        </div>
        <div className="text-[21px] font-extrabold mb-[22px]">Haftalık Rapor</div>

        <HaftalikRaporForm
          musteriler={musteriler.map((m) => m.customer)}
          secilenMusteriId={musteriId}
          parseller={secilenParseller}
          kayitlar={kayitlar}
        />
      </div>
    </div>
  );
}
