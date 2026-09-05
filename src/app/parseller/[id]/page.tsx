import Link from "next/link";
import { notFound } from "next/navigation";
import { getParcelDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { ChevronRightIcon, PlusIcon, RECORD_TYPE_ICONS, GOREV_DURUM_LABEL, GOREV_DURUM_STYLE } from "@/components/icons";
import { ParcelDrawMap } from "@/components/map/ParcelDrawMap";
import { GorevDurumSelect } from "@/components/GorevDurumSelect";
import { SilButonu } from "@/components/SilButonu";
import { ParselHaritaKayitDuzeni } from "@/components/ParselHaritaKayitDuzeni";
import { removeGorevAction, removeRecordAction } from "@/lib/actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ParselDetayPage(props: PageProps<"/parseller/[id]">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getParcelDetail(id, user);
  if (!detail) notFound();
  const { parcel, customer, timeline, gorevler, kuyu } = detail;

  const searchParams = await props.searchParams;
  const sekme = searchParams.sekme === "gorevler" ? "gorevler" : "kayitlar";
  const acikGorevSayisi = gorevler.filter((g) => g.gorev.durum !== "tamamlandi").length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-2.5">
          <Link href="/musteriler">Müşteriler</Link>
          <ChevronRightIcon className="text-text-muted" />
          {customer && <Link href={`/musteriler/${customer.id}`}>{customer.ad}</Link>}
          <ChevronRightIcon className="text-text-muted" />
          <span className="text-text font-bold">{parcel.ad}</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="text-xl font-extrabold">{parcel.ad}</div>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold bg-primary-bg text-[#4A4F45] px-3 py-1.5 rounded-full">
              {parcel.urun}
            </span>
            <span className="text-[13px] text-text-secondary">{parcel.alanDonum} dönüm</span>
            {parcel.agacSayisi && <span className="text-[13px] text-text-secondary">{parcel.agacSayisi.toLocaleString("tr-TR")} ağaç</span>}
            {parcel.ekimDuzeni && <span className="text-[13px] text-text-secondary">Ekim düzeni: {parcel.ekimDuzeni}</span>}
            {kuyu && <span className="text-[13px] text-text-secondary">Kuyu: {kuyu.ad}</span>}
            <span className="text-[13px] text-text-secondary">
              {timeline[0] ? `Son ziyaret: ${formatDate(timeline[0].record.tarih)}` : "Henüz ziyaret yok"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/parseller/${parcel.id}/duzenle`}
              className="px-4 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
            >
              Düzenle
            </Link>
            <Link
              href={`/parseller/${parcel.id}/sulama-uyumu`}
              className="px-4 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
            >
              Sulama Uyumu
            </Link>
            <Link
              href={`/parseller/${parcel.id}/beslenme`}
              className="px-4 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
            >
              Beslenme Programı
            </Link>
            <Link
              href={`/parseller/${parcel.id}/fertigasyon`}
              className="px-4 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
            >
              Fertigasyon
            </Link>
            <Link
              href={`/parseller/${parcel.id}/yeni-kayit`}
              className="flex items-center gap-2 bg-primary text-cream px-4 py-2.5 rounded-[10px] text-[13.5px] font-bold"
            >
              <PlusIcon size={15} className="text-cream" />
              Yeni Kayıt Ekle
            </Link>
          </div>
        </div>
      </div>

      <ParselHaritaKayitDuzeni
        harita={<ParcelDrawMap parcelId={parcel.id} initialSinir={parcel.sinir} initialKonum={parcel.konum} />}
        kayitPaneli={
          <>
          <div className="flex items-center gap-2 mb-[18px]">
            <Link
              href={`/parseller/${parcel.id}`}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold ${
                sekme === "kayitlar" ? "bg-primary text-cream" : "bg-cream text-text-secondary"
              }`}
            >
              Kayıt Geçmişi ({timeline.length})
            </Link>
            <Link
              href={`/parseller/${parcel.id}?sekme=gorevler`}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold ${
                sekme === "gorevler" ? "bg-primary text-cream" : "bg-cream text-text-secondary"
              }`}
            >
              Görevler ({acikGorevSayisi} açık)
            </Link>
          </div>

          {sekme === "gorevler" ? (
            <div className="flex flex-col gap-3">
              <Link
                href={`/parseller/${parcel.id}/gorev-ekle`}
                className="flex items-center justify-center gap-1.5 border border-dashed border-border rounded-xl py-2.5 text-[12.5px] font-bold text-primary"
              >
                <PlusIcon size={13} className="text-primary" />
                Yeni Görev Ekle
              </Link>

              {gorevler.length === 0 ? (
                <div className="text-sm text-text-secondary py-8 text-center border border-dashed border-border rounded-xl">
                  Bu parsel için henüz görev eklenmedi.
                </div>
              ) : (
                gorevler.map(({ gorev, sorumlu }) => (
                  <div key={gorev.id} className="bg-white border border-border rounded-xl p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-bold text-primary bg-primary-bg px-2.5 py-0.5 rounded-full">
                        {gorev.konu}
                      </span>
                      <GorevDurumSelect gorevId={gorev.id} parcelId={parcel.id} durum={gorev.durum} />
                    </div>
                    <div className="text-[13px] font-semibold mt-2">{gorev.gozlem}</div>
                    {gorev.onerilenUygulama && (
                      <div className="text-xs text-text-secondary mt-1">→ {gorev.onerilenUygulama}</div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-[11px] text-text-muted">
                        {formatDate(gorev.tarih)}
                        {gorev.terminTarihi && ` · Termin: ${formatDate(gorev.terminTarihi)}`}
                        {sorumlu && ` · ${sorumlu.ad}`}
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <Link href={`/parseller/${parcel.id}/gorev/${gorev.id}/duzenle`} className="text-[11px] font-bold text-primary">
                          Düzenle
                        </Link>
                        <SilButonu
                          onSil={removeGorevAction.bind(null, gorev.id, parcel.id)}
                          etiket="Sil"
                          className="text-[11px] font-bold text-red disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-sm text-text-secondary py-8 text-center border border-dashed border-border rounded-xl">
              Bu parsel için henüz saha kaydı eklenmedi.
            </div>
          ) : (
            <div className="relative pl-[26px]">
              <div className="absolute left-[9px] top-1.5 bottom-1.5 w-0.5 bg-border" />
              <div className="flex flex-col gap-[22px]">
                {timeline.map(({ record, type, engineer }) => {
                  const Icon = RECORD_TYPE_ICONS(type?.ad ?? "");
                  return (
                    <div key={record.id} className="relative">
                      <div className="absolute -left-[26px] top-0.5 w-5 h-5 rounded-full bg-primary-bg border-2 border-primary flex items-center justify-center">
                        <Icon size={11} className="text-primary" />
                      </div>
                      <div className="bg-white border border-border rounded-xl p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13.5px] font-bold">{type?.ad ?? "Kayıt"}</span>
                          <div className="flex items-center gap-1.5">
                            {record.durum && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${GOREV_DURUM_STYLE[record.durum] ?? "bg-cream text-text-secondary"}`}>
                                {GOREV_DURUM_LABEL[record.durum] ?? record.durum}
                              </span>
                            )}
                            <span className="text-[11.5px] text-text-muted">{record.donemBitis ? `${formatDate(record.tarih)} – ${formatDate(record.donemBitis)}` : formatDate(record.tarih)}</span>
                          </div>
                        </div>
                        {record.fenolojikDonem && (
                          <div className="text-[11px] text-primary font-semibold mt-1">{record.fenolojikDonem}</div>
                        )}
                        <div className="text-[12.5px] text-[#4A4F45] mt-1.5">
                          {Object.entries(record.values)
                            .map(([, v]) => v)
                            .join(" · ")}
                        </div>
                        {record.not && (
                          <div className="text-[11.5px] text-text-muted mt-2">
                            {record.not} — {engineer?.ad}
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 mt-2 pt-2 border-t border-border-soft">
                          <Link href={`/parseller/${parcel.id}/kayit/${record.id}/duzenle`} className="text-[11px] font-bold text-primary">
                            Düzenle
                          </Link>
                          <form action={removeRecordAction.bind(null, record.id)}>
                            <button type="submit" className="text-[11px] font-bold text-red">
                              Sil
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </>
        }
      />
    </div>
  );
}
