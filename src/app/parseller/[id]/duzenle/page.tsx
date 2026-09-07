import Link from "next/link";
import { notFound } from "next/navigation";
import { getParcelDetail, parselOnerileriCikar } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { sulamaKuyulari } from "@/lib/repositories";
import { updateParcelAction, removeParcelAction } from "@/lib/actions";
import { ParselDuzenleForm } from "./ParselDuzenleForm";

export default async function ParselDuzenlePage(props: PageProps<"/parseller/[id]/duzenle">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getParcelDetail(id, user);
  if (!detail) notFound();
  const { parcel, customer } = detail;
  const [kuyular, oneriler] = await Promise.all([
    customer ? sulamaKuyulari.listByCustomer(customer.id) : Promise.resolve([]),
    parselOnerileriCikar(parcel.customerId, parcel.id),
  ]);

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

        <ParselDuzenleForm
          parcel={parcel}
          customerId={customer?.id}
          kuyular={kuyular}
          oneriler={oneriler}
          action={action}
          silAction={silAction}
        />
      </div>
    </div>
  );
}
