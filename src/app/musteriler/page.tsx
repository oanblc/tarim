import Link from "next/link";
import { getCustomersView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { PlusIcon, SearchIcon, UsersIcon } from "@/components/icons";
import { SayfaBasligi } from "@/components/SayfaBasligi";

export default async function MusterilerPage(props: PageProps<"/musteriler">) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim().toLocaleLowerCase("tr") : "";

  const allRows = await getCustomersView(user);
  const rows = q
    ? allRows.filter(
        ({ customer }) =>
          customer.ad.toLocaleLowerCase("tr").includes(q) || (customer.adres ?? "").toLocaleLowerCase("tr").includes(q),
      )
    : allRows;

  return (
    <div className="p-8 lg:p-10">
      <SayfaBasligi
        icon={UsersIcon}
        title="Müşteriler"
        subtitle={`${allRows.length} müşteri`}
        action={
          <Link
            href="/musteriler/yeni"
            className="flex items-center gap-2 bg-primary text-cream px-[18px] py-2.5 rounded-[10px] text-sm font-bold"
          >
            <PlusIcon className="text-cream" />
            Yeni Müşteri
          </Link>
        }
      />

      <form className="flex items-center gap-2 bg-white border border-border rounded-[10px] px-3.5 py-2.5 mb-5 max-w-[360px]" action="/musteriler">
        <SearchIcon size={15} className="text-text-muted shrink-0" />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Müşteri adı veya adres ara..."
          className="flex-1 text-[13px] outline-none"
        />
      </form>

      {rows.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          {q ? "Bu kritere uyan müşteri bulunamadı." : "Henüz müşteri eklenmedi."}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[2.2fr_1fr_1fr_44px] px-5 py-3 border-b border-border bg-[#FAF9F4]">
            <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Müşteri</span>
            <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Parsel</span>
            <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Sorumlu</span>
            <span />
          </div>

          {rows.map(({ customer, parcelCount, engineer }) => (
            <Link
              key={customer.id}
              href={`/musteriler/${customer.id}`}
              className="grid grid-cols-[2.2fr_1fr_1fr_44px] items-center px-5 py-4 border-b border-border-soft last:border-0 hover:bg-cream/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-primary-bg flex items-center justify-center text-[13px] font-bold text-primary shrink-0">
                  {customer.ad
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold truncate">{customer.ad}</div>
                  <div className="text-xs text-text-secondary truncate">{customer.adres}</div>
                </div>
              </div>
              <span className="text-[13px] font-semibold">{parcelCount} parsel</span>
              <span className="text-[13px]">{engineer?.ad}</span>
              <span />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
