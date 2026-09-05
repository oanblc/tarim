import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getDashboardStats, getRecentRecordsView } from "@/lib/queries";
import { PlusIcon, RECORD_TYPE_ICONS, HomeIcon } from "@/components/icons";
import { SayfaBasligi } from "@/components/SayfaBasligi";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, recent] = await Promise.all([
    getDashboardStats(user),
    getRecentRecordsView(user, 6),
  ]);

  const today = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });

  return (
    <div className="p-8 lg:p-10">
      <SayfaBasligi
        icon={HomeIcon}
        title={`Merhaba, ${user?.ad.split(" ")[0] ?? "Mühendis"}`}
        subtitle={today}
        action={
          <Link
            href="/musteriler"
            className="flex items-center gap-2 bg-primary text-cream px-[18px] py-2.5 rounded-[10px] text-sm font-bold"
          >
            <PlusIcon className="text-cream" />
            Yeni Kayıt İçin Parsel Seç
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Toplam Müşteri" value={stats.customerCount} unit="müşteri" />
        <StatCard label="Toplam Parsel" value={stats.parcelCount} unit="parsel" />
        <StatCard label="Toplam Kayıt" value={stats.recordCount} unit="kayıt" />
        <StatCard label="Bu Ay Eklenen" value={stats.thisMonthCount} unit="kayıt" highlight />
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[15px] font-bold">Son Eklenen Kayıtlar</span>
          <Link href="/kayitlar" className="text-[12.5px] text-primary font-semibold">
            Tümünü gör
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-sm text-text-secondary py-6 text-center">Henüz saha kaydı eklenmedi.</div>
        ) : (
          <div className="flex flex-col">
            {recent.map(({ record, parcel, customer, type, engineer }) => {
              const Icon = RECORD_TYPE_ICONS(type?.ad ?? "");
              return (
                <Link
                  key={record.id}
                  href={parcel ? `/parseller/${parcel.id}` : "/kayitlar"}
                  className="flex items-center gap-3 py-2.5 border-b border-border-soft last:border-0 hover:bg-cream/50 -mx-2 px-2 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-[8px] bg-primary-bg flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <span className="text-[13px] font-semibold truncate shrink-0 max-w-[45%]">
                    {type?.ad ?? "Kayıt"} — {parcel?.ad ?? "Bilinmeyen parsel"}
                  </span>
                  <span className="text-[12px] text-text-secondary truncate flex-1 min-w-0">{customer?.ad}</span>
                  <span className="text-[11.5px] text-text-muted shrink-0 whitespace-nowrap">
                    {formatDateTime(record.createdAt)} · {engineer?.ad}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white border border-border rounded-[14px] p-[18px]">
      <span className="text-[12.5px] text-text-secondary font-semibold">{label}</span>
      <div className={`text-[28px] font-extrabold mt-2 ${highlight ? "text-primary" : ""}`}>
        {value} <span className="text-[13px] font-semibold text-text-secondary">{unit}</span>
      </div>
    </div>
  );
}
