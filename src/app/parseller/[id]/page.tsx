import Link from "next/link";
import { notFound } from "next/navigation";
import { getParcelDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { ChevronRightIcon, PlusIcon, RECORD_TYPE_ICONS, GOREV_DURUM_LABEL, GOREV_DURUM_BADGE, StarIcon } from "@/components/icons";
import { ParcelDrawMap } from "@/components/map/ParcelDrawMap";
import { GorevDurumSelect } from "@/components/GorevDurumSelect";
import { SilButonu } from "@/components/SilButonu";
import { ParselHaritaKayitDuzeni } from "@/components/ParselHaritaKayitDuzeni";
import { removeGorevAction, removeRecordAction } from "@/lib/actions";
import { parselCesitleri, agacAraligiHesapla } from "@/lib/parsel";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ParselDetayPage(props: PageProps<"/parseller/[id]">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getParcelDetail(id, user);
  if (!detail) notFound();
  const { parcel, customer, timeline, gorevler, kuyu, degerlendirmeSorulari, degerlendirmeler } = detail;

  const searchParams = await props.searchParams;
  const sekme =
    searchParams.sekme === "gorevler" ? "gorevler" : searchParams.sekme === "degerlendirme" ? "degerlendirme" : "kayitlar";
  const acikGorevSayisi = gorevler.filter((g) => g.gorev.durum !== "tamamlandi").length;
  const cesitler = parselCesitleri(parcel);
  const aralik = parcel.agacSayisi ? agacAraligiHesapla(parcel.alanDonum, parcel.agacSayisi) : null;
  const buYil = String(new Date().getFullYear());

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
            <div>
              <div className="text-xl font-extrabold">{parcel.ad}</div>
              {parcel.bolge && <div className="text-[12px] text-text-muted">{parcel.bolge}</div>}
            </div>
            {cesitler.length > 0 && (
              <span className="flex flex-wrap items-center gap-1.5">
                {cesitler.map((c) => (
                  <Badge key={c}>{c}</Badge>
                ))}
              </span>
            )}
            <span className="text-[13px] text-text-secondary">{parcel.alanDonum} dönüm</span>
            {parcel.agacSayisi && (
              <span className="text-[13px] text-text-secondary">
                {parcel.agacSayisi.toLocaleString("tr-TR")} ağaç
                {aralik && ` · ≈${aralik.araligiM}x${aralik.araligiM}m`}
              </span>
            )}
            {!parcel.agacSayisi && parcel.ekimDuzeni && (
              <span className="text-[13px] text-text-secondary">Ekim düzeni: {parcel.ekimDuzeni}</span>
            )}
            {parcel.anaclar && parcel.anaclar.length > 0 && (
              <span className="text-[13px] text-text-secondary">Anaç: {parcel.anaclar.join(", ")}</span>
            )}
            {parcel.sulamaSekli && <span className="text-[13px] text-text-secondary">Sulama: {parcel.sulamaSekli}</span>}
            {kuyu && <span className="text-[13px] text-text-secondary">Kuyu: {kuyu.ad}</span>}
            <span className="text-[13px] text-text-secondary">
              {timeline[0] ? `Son ziyaret: ${formatDate(timeline[0].record.tarih)}` : "Henüz ziyaret yok"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button href={`/parseller/${parcel.id}/duzenle`} variant="outline">
              Düzenle
            </Button>
            <Button href={`/parseller/${parcel.id}/sulama-uyumu`} variant="outline">
              Sulama Uyumu
            </Button>
            <Button href={`/parseller/${parcel.id}/beslenme`} variant="outline">
              Beslenme Programı
            </Button>
            <Button href={`/parseller/${parcel.id}/fertigasyon`} variant="outline">
              Fertigasyon
            </Button>
            <Button href={`/parseller/${parcel.id}/yeni-kayit`} startIcon={<PlusIcon size={15} className="text-cream" />}>
              Yeni Kayıt Ekle
            </Button>
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
            <Link
              href={`/parseller/${parcel.id}?sekme=degerlendirme`}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold ${
                sekme === "degerlendirme" ? "bg-primary text-cream" : "bg-cream text-text-secondary"
              }`}
            >
              Genel Değerlendirme ({degerlendirmeler.length})
            </Link>
          </div>

          {sekme === "degerlendirme" ? (
            <div className="flex flex-col gap-3">
              <Link
                href={`/parseller/${parcel.id}/degerlendirme`}
                className="flex items-center justify-center gap-1.5 border border-dashed border-border rounded-xl py-2.5 text-[12.5px] font-bold text-primary"
              >
                <PlusIcon size={13} className="text-primary" />
                {degerlendirmeler.some((d) => d.yil === buYil) ? `${buYil} Değerlendirmesini Düzenle` : `${buYil} İçin Değerlendirme Ekle`}
              </Link>

              {degerlendirmeSorulari.length === 0 ? (
                <div className="text-sm text-text-secondary py-8 text-center border border-dashed border-border rounded-xl">
                  Henüz bir değerlendirme sorusu tanımlanmadı — Ayarlar&apos;dan ekleyebilirsiniz.
                </div>
              ) : degerlendirmeler.length === 0 ? (
                <div className="text-sm text-text-secondary py-8 text-center border border-dashed border-border rounded-xl">
                  Bu parsel için henüz değerlendirme girilmedi.
                </div>
              ) : (
                degerlendirmeler.map((d) => (
                  <div key={d.id} className="bg-white border border-border rounded-xl p-3.5">
                    <div className="text-[13.5px] font-bold mb-2">{d.yil}</div>
                    <div className="flex flex-col gap-2.5">
                      {d.cevaplar.map((c) => {
                        const soru = degerlendirmeSorulari.find((s) => s.id === c.soruId);
                        if (!soru) return null;
                        return (
                          <div key={c.soruId}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12.5px] text-[#4A4F45]">{soru.soru}</span>
                              <span className="flex items-center gap-0.5 shrink-0">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <StarIcon key={n} size={13} filled={n <= c.puan} className={n <= c.puan ? "text-amber" : "text-border"} />
                                ))}
                              </span>
                            </div>
                            {c.not && <div className="text-[11.5px] text-text-muted mt-0.5">{c.not}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : sekme === "gorevler" ? (
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
                      <Badge>{gorev.konu}</Badge>
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
                              <Badge color={GOREV_DURUM_BADGE[record.durum] ?? "light"} size="sm">
                                {GOREV_DURUM_LABEL[record.durum] ?? record.durum}
                              </Badge>
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
