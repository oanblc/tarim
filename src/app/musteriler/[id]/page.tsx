import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import {
  ChevronRightIcon,
  PlusIcon,
  GOREV_DURUM_LABEL,
  GOREV_DURUM_STYLE,
  RAPOR_TUR_LABEL,
  RAPOR_TUR_STYLE,
  ReportsIcon,
  ThermometerIcon,
  DropletIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  UsersIcon,
  MapIcon,
  SproutIcon,
  ClockIcon,
} from "@/components/icons";

function formatDate(iso?: string) {
  if (!iso) return "Henüz kayıt yok";
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function formatKisaTarih(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export default async function MusteriDetayPage(props: PageProps<"/musteriler/[id]">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getCustomerDetail(id, user);
  if (!detail) notFound();
  const { customer, engineer, parcels, raporlar: tumRaporlar } = detail;

  const searchParams = await props.searchParams;
  const raporBaslangic = typeof searchParams.raporBaslangic === "string" ? searchParams.raporBaslangic : "";
  const raporBitis = typeof searchParams.raporBitis === "string" ? searchParams.raporBitis : "";

  const filtreAktif = Boolean(raporBaslangic || raporBitis);
  const filtrelenmisRaporlar = tumRaporlar.filter((r) => {
    if (raporBaslangic && r.donemBitis < raporBaslangic) return false;
    if (raporBitis && r.donemBaslangic > raporBitis) return false;
    return true;
  });
  const raporlar = filtreAktif ? filtrelenmisRaporlar : filtrelenmisRaporlar.slice(0, 20);

  const toplamAlan = parcels.reduce((sum, p) => sum + p.parcel.alanDonum, 0);
  const sonZiyaret = parcels
    .map((p) => p.lastRecordDate)
    .filter((t): t is string => Boolean(t))
    .sort()
    .reverse()[0];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 lg:p-10">
        <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-4">
          <Link href="/musteriler">Müşteriler</Link>
          <ChevronRightIcon className="text-text-muted" />
          <span className="text-text font-bold">{customer.ad}</span>
        </div>

        <div className="grid grid-cols-[1fr_480px] gap-6 items-start">
          {/* Sol: bilgiler */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-primary-bg to-cream px-6 pt-6 pb-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-[17px] font-extrabold text-cream shrink-0 shadow-sm shadow-black/10">
                    {customer.ad
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[19px] font-extrabold leading-tight">{customer.ad}</div>
                      <Link href={`/musteriler/${customer.id}/duzenle`} className="text-[12px] font-bold text-primary shrink-0">
                        Düzenle
                      </Link>
                    </div>
                    {customer.adres && (
                      <div className="flex items-center gap-1.5 text-[12.5px] text-text-secondary mt-1">
                        <MapPinIcon size={13} className="text-text-muted shrink-0" />
                        {customer.adres}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-3 text-[13px] text-[#4A4F45]">
                  {customer.telefon && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon size={14} className="text-primary shrink-0" />
                      {customer.telefon}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 min-w-0">
                      <MailIcon size={14} className="text-primary shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 col-span-2">
                    <UsersIcon size={14} className="text-primary shrink-0" />
                    Sorumlu: <span className="font-semibold">{engineer?.ad ?? "Atanmadı"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5">
                  <Link
                    href={`/musteriler/${customer.id}/rapor`}
                    className="flex items-center justify-center gap-1.5 bg-primary text-cream px-4 py-2.5 rounded-[9px] text-[12.5px] font-bold whitespace-nowrap"
                  >
                    <ReportsIcon size={14} className="text-cream" />
                    Rapor Oluştur
                  </Link>
                  <Link
                    href={`/musteriler/${customer.id}/isi-toplami`}
                    className="flex items-center justify-center gap-1.5 bg-cream border border-border px-4 py-2.5 rounded-[9px] text-[12.5px] font-bold text-[#4A4F45] whitespace-nowrap"
                  >
                    <ThermometerIcon size={14} className="text-[#4A4F45]" />
                    Isı Toplamı
                  </Link>
                  <Link
                    href={`/musteriler/${customer.id}/sulama-kuyulari`}
                    className="flex items-center justify-center gap-1.5 bg-cream border border-border px-4 py-2.5 rounded-[9px] text-[12.5px] font-bold text-[#4A4F45] whitespace-nowrap"
                  >
                    <DropletIcon size={14} className="text-[#4A4F45]" />
                    Kuyular
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 text-text-muted mb-2">
                  <MapIcon size={14} />
                  <span className="text-[10.5px] font-bold uppercase tracking-wide">Parsel</span>
                </div>
                <div className="text-[19px] font-extrabold">{parcels.length}</div>
              </div>
              <div className="bg-white border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 text-text-muted mb-2">
                  <SproutIcon size={14} />
                  <span className="text-[10.5px] font-bold uppercase tracking-wide">Toplam Alan</span>
                </div>
                <div className="text-[19px] font-extrabold">
                  {toplamAlan.toLocaleString("tr-TR")} <span className="text-[12px] font-semibold text-text-secondary">dönüm</span>
                </div>
              </div>
              <div className="bg-white border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 text-text-muted mb-2">
                  <ClockIcon size={14} />
                  <span className="text-[10.5px] font-bold uppercase tracking-wide">Son Ziyaret</span>
                </div>
                <div className="text-[13.5px] font-extrabold leading-tight">{sonZiyaret ? formatDate(sonZiyaret) : "—"}</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold">Parseller</span>
                <Link href={`/musteriler/${customer.id}/parsel-ekle`} className="flex items-center gap-1.5 text-[12.5px] font-bold text-primary">
                  <PlusIcon size={14} className="text-primary" />
                  Parsel Ekle
                </Link>
              </div>

              {parcels.length === 0 ? (
                <div className="text-sm text-text-secondary py-8 text-center border border-dashed border-border rounded-2xl bg-white">
                  Bu müşteriye henüz parsel eklenmedi.
                </div>
              ) : (
                <div className="bg-white border border-border rounded-2xl overflow-hidden">
                  {parcels.map(({ parcel, lastRecordDate, sonDurum }) => (
                    <Link
                      key={parcel.id}
                      href={`/parseller/${parcel.id}`}
                      className="group flex items-center gap-3.5 px-4 py-3.5 border-b border-border-soft last:border-0 hover:bg-cream/60"
                    >
                      <div className="w-10 h-10 rounded-[10px] bg-primary-bg flex items-center justify-center shrink-0">
                        <SproutIcon size={17} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold truncate">{parcel.ad}</span>
                          {sonDurum && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${GOREV_DURUM_STYLE[sonDurum]}`}>
                              {GOREV_DURUM_LABEL[sonDurum] ?? sonDurum}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-text-secondary truncate mt-0.5">
                          {parcel.urun} · son kayıt {formatDate(lastRecordDate)}
                        </div>
                      </div>
                      <span className="text-[11.5px] font-bold text-text-secondary bg-cream px-2.5 py-1 rounded-full shrink-0">
                        {parcel.alanDonum} dönüm
                      </span>
                      <ChevronRightIcon size={15} className="text-text-muted shrink-0 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sağ: bu müşteri için yazılan raporlar */}
          <div className="bg-white border border-border rounded-2xl p-5 sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold">Raporlar</span>
              <Link href={`/musteriler/${customer.id}/rapor`} className="flex items-center gap-1 text-[12px] font-bold text-primary">
                <PlusIcon size={12} className="text-primary" />
                Yeni
              </Link>
            </div>

            <form className="grid grid-cols-2 gap-2 mb-4" action={`/musteriler/${customer.id}`}>
              <label className="block">
                <div className="text-[10.5px] font-bold text-text-muted mb-1 uppercase tracking-wide">Başlangıç</div>
                <input
                  type="date"
                  name="raporBaslangic"
                  defaultValue={raporBaslangic}
                  className="w-full border border-border rounded-[8px] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <div className="text-[10.5px] font-bold text-text-muted mb-1 uppercase tracking-wide">Bitiş</div>
                <input
                  type="date"
                  name="raporBitis"
                  defaultValue={raporBitis}
                  className="w-full border border-border rounded-[8px] px-2.5 py-1.5 text-[12px] outline-none focus:border-primary"
                />
              </label>
              <button type="submit" className="col-span-2 bg-primary text-cream text-[12px] font-bold py-2 rounded-[8px]">
                Filtrele
              </button>
            </form>

            {raporlar.length === 0 ? (
              <div className="text-[12.5px] text-text-secondary py-6 text-center border border-dashed border-border rounded-xl">
                {tumRaporlar.length === 0
                  ? "Bu müşteri için henüz rapor oluşturulmadı."
                  : "Bu kritere uyan rapor bulunamadı."}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {raporlar.map((rapor) => (
                  <Link
                    key={rapor.id}
                    href={`/raporlar/${rapor.id}`}
                    className="block bg-cream/60 hover:bg-cream border border-border-soft rounded-xl px-3.5 py-3 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-bold">
                        {formatKisaTarih(rapor.donemBaslangic)} – {formatKisaTarih(rapor.donemBitis)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          RAPOR_TUR_STYLE[rapor.tur] ?? "bg-blue-bg text-blue"
                        }`}
                      >
                        {RAPOR_TUR_LABEL[rapor.tur] ?? "Genel Rapor"}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-muted mt-1">
                      {rapor.parcelIds.length} parsel · {formatKisaTarih(rapor.createdAt)} oluşturuldu
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!filtreAktif && tumRaporlar.length > raporlar.length && (
              <div className="text-[11px] text-text-muted text-center mt-3">
                Son {raporlar.length} rapor gösteriliyor · daha eskileri için yukarıdaki filtreyi kullanın
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
