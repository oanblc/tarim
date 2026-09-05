import Link from "next/link";
import { getRecentRecordsView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { RECORD_TYPE_ICONS, RecordsIcon } from "@/components/icons";
import { SayfaBasligi } from "@/components/SayfaBasligi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function KayitlarPage() {
  const user = await requireUser();
  const rows = await getRecentRecordsView(user, 200);

  return (
    <div className="p-8 lg:p-10">
      <SayfaBasligi icon={RecordsIcon} title="Kayıtlar" subtitle={`Tüm parsellerdeki saha kayıtları · ${rows.length} kayıt`} />

      {rows.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Henüz saha kaydı eklenmedi.
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1.4fr_1fr_1fr_1fr] px-5 py-3 border-b border-border bg-[#FAF9F4]">
            <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Parsel</span>
            <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Müşteri</span>
            <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Tip</span>
            <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Tarih</span>
            <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Mühendis</span>
          </div>

          {rows.map(({ record, parcel, customer, type, engineer }) => {
            const Icon = RECORD_TYPE_ICONS(type?.ad ?? "");
            return (
              <Link
                key={record.id}
                href={parcel ? `/parseller/${parcel.id}` : "#"}
                className="grid grid-cols-[1.6fr_1.4fr_1fr_1fr_1fr] items-center px-5 py-3.5 border-b border-border-soft last:border-0 hover:bg-cream/60"
              >
                <span className="text-[13px] font-bold truncate">{parcel?.ad ?? "—"}</span>
                <span className="text-[13px] text-text-secondary truncate">{customer?.ad ?? "—"}</span>
                <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                  <Icon size={14} className="text-primary" />
                  {type?.ad ?? "—"}
                </span>
                <span className="text-[13px] text-text-secondary">{record.donemBitis ? `${formatDate(record.tarih)} – ${formatDate(record.donemBitis)}` : formatDate(record.tarih)}</span>
                <span className="text-[13px] text-text-secondary">{engineer?.ad ?? "—"}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
