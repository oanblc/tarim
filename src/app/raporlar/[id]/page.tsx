import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { removeReportAction } from "@/lib/actions";
import { MailIcon, SproutIcon, RAPOR_TUR_LABEL, RAPOR_TUR_STYLE, GOREV_DURUM_LABEL } from "@/components/icons";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function RaporDetayPage(props: PageProps<"/raporlar/[id]">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getReportDetail(id, user);
  if (!detail) notFound();
  const { report, customer, engineer, parcelSections, totalAlan, totalKayit } = detail;

  const donemLabel = `${formatDate(report.donemBaslangic)} – ${formatDate(report.donemBitis)}`;

  const tumSatirlar = parcelSections
    .flatMap(({ parcel, records }) => records.map(({ record, type }) => ({ parcel, record, type })))
    .sort((a, b) => a.record.tarih.localeCompare(b.record.tarih));

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[680px]">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div>
            <div className="text-[12.5px] text-text-muted mb-1">
              <Link href="/raporlar">Raporlar</Link>
            </div>
            <div className="text-[21px] font-extrabold">{customer?.ad} — {donemLabel}</div>
          </div>
          <span
            className={`text-[11.5px] font-bold px-3 py-1.5 rounded-full shrink-0 ${
              RAPOR_TUR_STYLE[report.tur] ?? "bg-blue-bg text-blue"
            }`}
          >
            {RAPOR_TUR_LABEL[report.tur] ?? "Genel Rapor"}
          </span>
        </div>

        <div className="bg-[#EDEBE1] rounded-2xl p-8 flex justify-center mb-6">
          <div className="w-full max-w-[560px] bg-white shadow-xl shadow-black/10 p-10">
            <div className="flex items-center justify-between border-b-[3px] border-primary pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-[30px] h-[30px] rounded-lg bg-primary flex items-center justify-center">
                  <SproutIcon size={15} className="text-cream" />
                </div>
                <span className="text-sm font-extrabold">TarlaDefteri</span>
              </div>
              <span className="text-xs text-text-muted font-semibold">Saha Raporu</span>
            </div>

            <div className="text-xl font-extrabold mb-1">{customer?.ad}</div>
            <div className="text-[13px] text-text-secondary mb-6">
              {donemLabel} · Hazırlayan: {engineer?.ad ?? "—"}, Ziraat Mühendisi
            </div>

            <div className="grid grid-cols-3 gap-3 mb-7">
              <SummaryTile label="Parsel" value={String(parcelSections.length)} />
              <SummaryTile label="Kayıt" value={String(totalKayit)} />
              <SummaryTile label="Alan" value={`${totalAlan.toFixed(1)} dönüm`} />
            </div>

            {report.ozet && (
              <>
                <div className="text-sm font-extrabold mb-2.5">Mühendis Değerlendirmesi</div>
                <div className="text-[12.5px] text-[#4A4F45] leading-relaxed mb-6">{report.ozet}</div>
              </>
            )}

            <div className="text-sm font-extrabold mb-3">Girilen Veriler</div>
            {tumSatirlar.length === 0 ? (
              <div className="text-xs text-text-secondary">Bu dönemde kayıt girilmedi.</div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border text-left text-text-muted">
                      <th className="px-1 py-1.5 font-semibold">Parsel</th>
                      <th className="px-1 py-1.5 font-semibold">Tarih</th>
                      <th className="px-1 py-1.5 font-semibold">Tip</th>
                      <th className="px-1 py-1.5 font-semibold">Detay</th>
                      <th className="px-1 py-1.5 font-semibold">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tumSatirlar.map(({ parcel, record, type }) => {
                      const { recete, ...digerAlanlar } = record.values as Record<string, string | number> & {
                        recete?: string;
                      };
                      const detaylar = [
                        Object.values(digerAlanlar).filter(Boolean).join(", "),
                        recete ? `Reçete: ${recete}` : "",
                        record.fenolojikDonem ? `Dönem: ${record.fenolojikDonem}` : "",
                        record.not ?? "",
                      ].filter(Boolean);
                      return (
                        <tr key={record.id} className="border-b border-border-soft align-top">
                          <td className="px-1 py-1.5 font-semibold text-[#4A4F45] whitespace-nowrap">{parcel?.ad}</td>
                          <td className="px-1 py-1.5 whitespace-nowrap">
                            {record.donemBitis
                              ? `${formatDate(record.tarih)} – ${formatDate(record.donemBitis)}`
                              : formatDate(record.tarih)}
                          </td>
                          <td className="px-1 py-1.5 whitespace-nowrap">{type?.ad}</td>
                          <td className="px-1 py-1.5 text-text-secondary">{detaylar.join(" · ") || "—"}</td>
                          <td className="px-1 py-1.5 whitespace-nowrap">
                            {record.durum ? GOREV_DURUM_LABEL[record.durum] ?? record.durum : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 justify-center text-[13px] text-text-muted mb-5">
          <MailIcon size={15} className="text-text-muted" />
          E-postayla gönderim yakında eklenecek — şimdilik bu önizlemeyi PDF olarak dışa aktarıp elden gönderebilirsiniz.
        </div>

        <div className="flex items-center justify-center gap-3">
          <form action={removeReportAction.bind(null, report.id)}>
            <button type="submit" className="px-4 py-2 rounded-[9px] border border-red text-red text-[12.5px] font-bold">
              Raporu Sil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream rounded-[10px] p-3.5">
      <div className="text-[11px] text-text-secondary font-semibold">{label}</div>
      <div className="text-[19px] font-extrabold mt-1">{value}</div>
    </div>
  );
}
