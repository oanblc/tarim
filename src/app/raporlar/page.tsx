import Link from "next/link";
import { getReportsView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { SearchIcon, ReportsIcon, ChevronRightIcon, ThermometerIcon, RAPOR_TUR_LABEL, RAPOR_TUR_STYLE } from "@/components/icons";
import { FarmSceneArt } from "@/components/FarmSceneArt";
import { WaterSceneArt } from "@/components/WaterSceneArt";
import { SummarySceneArt } from "@/components/SummarySceneArt";
import { SayfaBasligi } from "@/components/SayfaBasligi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}


export default async function RaporlarPage(props: PageProps<"/raporlar">) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim().toLowerCase() : "";

  const filtreliRows = (await getReportsView(user)).filter(({ customer }) => {
    if (q && !customer?.ad.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="p-8 lg:p-10">
      <SayfaBasligi icon={ReportsIcon} title="Raporlar" subtitle="Rapor türünü seçerek başla veya geçmiş raporlara göz at" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/raporlar/haftalik-rapor"
          className="relative overflow-hidden rounded-2xl h-[200px] group"
        >
          <FarmSceneArt className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest from-15% via-forest/70 via-60% to-primary/20 group-hover:from-forest transition-colors" />
          <div className="relative h-full flex flex-col justify-end p-5">
            <div className="w-10 h-10 rounded-[10px] bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
              <ReportsIcon size={18} className="text-cream" />
            </div>
            <div className="flex items-center gap-1 text-[15px] font-extrabold text-cream mb-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
              Haftalık Rapor
              <ChevronRightIcon size={13} className="text-cream" />
            </div>
            <div className="text-[12px] font-medium text-cream leading-relaxed [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
              Tarih, müşteri ve parsel seçip ilaç reçetesi, fenolojik dönem ve durum gir.
            </div>
          </div>
        </Link>
        <Link
          href="/raporlar/sulama-raporu"
          className="relative overflow-hidden rounded-2xl h-[200px] group"
        >
          <WaterSceneArt className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#204552] from-15% via-[#204552]/70 via-60% to-blue/15 group-hover:from-[#1A3945] transition-colors" />
          <div className="relative h-full flex flex-col justify-end p-5">
            <div className="w-10 h-10 rounded-[10px] bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
              <ReportsIcon size={18} className="text-cream" />
            </div>
            <div className="flex items-center gap-1 text-[15px] font-extrabold text-cream mb-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
              Sulama Raporu
              <ChevronRightIcon size={13} className="text-cream" />
            </div>
            <div className="text-[12px] font-medium text-cream leading-relaxed [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
              Müşteri seç, son 7 günün sulama saatlerini kuyu bazında gör ve düzenle.
            </div>
          </div>
        </Link>
        <Link
          href="/raporlar/haftalik-ozet"
          className="relative overflow-hidden rounded-2xl h-[200px] group bg-[#2B2418]"
        >
          <SummarySceneArt className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B2418] from-15% via-[#2B2418]/70 via-60% to-amber/15 group-hover:from-[#221C12] transition-colors" />
          <div className="relative h-full flex flex-col justify-end p-5">
            <div className="w-10 h-10 rounded-[10px] bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
              <ReportsIcon size={18} className="text-cream" />
            </div>
            <div className="flex items-center gap-1 text-[15px] font-extrabold text-cream mb-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
              Haftalık Özet
              <ChevronRightIcon size={13} className="text-cream" />
            </div>
            <div className="text-[12px] font-medium text-cream leading-relaxed [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
              Müşteri seç, Isı Toplamı, sulama ve tüm uygulama sayılarının hafta hafta panoramasını gör.
            </div>
          </div>
        </Link>
        <Link
          href="/raporlar/isi-gunlugu"
          className="relative overflow-hidden rounded-2xl h-[200px] group bg-gradient-to-t from-[#7A3B1E] from-15% via-[#7A3B1E]/70 via-60% to-amber/25 hover:from-[#5E2C15] transition-colors"
        >
          <div className="relative h-full flex flex-col justify-end p-5">
            <div className="w-10 h-10 rounded-[10px] bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
              <ThermometerIcon size={18} className="text-cream" />
            </div>
            <div className="flex items-center gap-1 text-[15px] font-extrabold text-cream mb-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
              Isı Günlüğü
              <ChevronRightIcon size={13} className="text-cream" />
            </div>
            <div className="text-[12px] font-medium text-cream leading-relaxed [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
              Müşteri seç, Open-Meteo&apos;dan otomatik çekilen günlük sıcaklık/yağış geçmişini gör.
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="text-[15px] font-bold">Oluşturulan Raporlar</div>
        <form className="flex items-center gap-2" action="/raporlar">
          <div className="flex items-center gap-2 bg-white border border-border rounded-[9px] px-3 py-2">
            <SearchIcon size={14} className="text-text-muted" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Müşteri ara..."
              className="text-[13px] outline-none w-[160px]"
            />
          </div>
          <button type="submit" className="bg-primary text-cream text-[13px] font-bold px-4 py-2 rounded-[9px]">
            Filtrele
          </button>
        </form>
      </div>

      {filtreliRows.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          {q
            ? "Bu kritere uyan rapor bulunamadı."
            : <>Henüz rapor oluşturulmadı. Yukarıdaki bir rapor türünü seçerek başlayabilirsin.</>}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          {filtreliRows.map(({ report, customer }) => (
            <Link
              key={report.id}
              href={`/raporlar/${report.id}`}
              className="flex items-center justify-between px-5 py-4 border-b border-border-soft last:border-0 hover:bg-cream/60"
            >
              <div>
                <div className="text-[13.5px] font-bold">{customer?.ad}</div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {formatDate(report.donemBaslangic)} – {formatDate(report.donemBitis)} · {report.parcelIds.length} parsel
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    RAPOR_TUR_STYLE[report.tur] ?? "bg-blue-bg text-blue"
                  }`}
                >
                  {RAPOR_TUR_LABEL[report.tur] ?? "Genel Rapor"}
                </span>
                <ChevronRightIcon size={14} className="text-text-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
