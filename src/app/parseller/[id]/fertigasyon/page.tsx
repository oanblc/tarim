import Link from "next/link";
import { notFound } from "next/navigation";
import { getFertigasyonView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { removeFertigasyonKaydiAction } from "@/lib/actions";
import { FERTIGASYON_BIRIM } from "@/lib/fertigasyon";
import { ChevronRightIcon } from "@/components/icons";
import { SilButonu } from "@/components/SilButonu";
import { FertigasyonForm } from "@/components/FertigasyonForm";
import { FertigasyonHesaplamaButonu } from "@/components/FertigasyonHesaplamaButonu";
import type { FertigasyonKaydi } from "@/types";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function formatSayi(n: number) {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
}

export default async function FertigasyonPage(props: PageProps<"/parseller/[id]/fertigasyon">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getFertigasyonView(id, user);
  if (!detail) notFound();
  const { parcel, customer, kayitlar } = detail;

  // Aynı tarih + ürün kombinasyonundaki vana satırlarını Excel'deki gibi tek
  // bir blokta toplayıp altına toplam satırı ekleyebilmek için gruplanır.
  const gruplar = new Map<string, { tarih: string; urun: FertigasyonKaydi["urun"]; satirlar: typeof kayitlar }>();
  for (const satir of kayitlar) {
    const anahtar = `${satir.kayit.tarih}|${satir.kayit.urun}`;
    if (!gruplar.has(anahtar)) {
      gruplar.set(anahtar, { tarih: satir.kayit.tarih, urun: satir.kayit.urun, satirlar: [] });
    }
    gruplar.get(anahtar)!.satirlar.push(satir);
  }

  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-2">
        <Link href="/musteriler">Müşteriler</Link>
        <ChevronRightIcon className="text-text-muted" />
        {customer && <Link href={`/musteriler/${customer.id}`}>{customer.ad}</Link>}
        <ChevronRightIcon className="text-text-muted" />
        <Link href={`/parseller/${parcel.id}`}>{parcel.ad}</Link>
        <ChevronRightIcon className="text-text-muted" />
        <span className="text-text font-bold">Fertigasyon</span>
      </div>
      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
        <div className="text-[21px] font-extrabold">{parcel.ad} — Fertigasyon (Damlamadan Verilen Gübre)</div>
        <FertigasyonHesaplamaButonu />
      </div>
      <div className="text-[12.5px] text-text-secondary mb-6">
        Vana bazında ağaç sayısı ve ağaç başına verilecek dozdan yola çıkarak, hazırlanması gereken çuval/bidon
        sayısı otomatik hesaplanır.
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          {gruplar.size === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
              Bu parsel için henüz fertigasyon kaydı girilmedi. Sağdaki formdan bir uygulama girerek başlayabilirsin.
            </div>
          ) : (
            Array.from(gruplar.values()).map((grup) => {
              const birim = FERTIGASYON_BIRIM[grup.urun];
              const toplamIhtiyac = grup.satirlar.reduce((s, x) => s + x.sonuc.toplamIhtiyac, 0);
              const toplamAmbalaj = grup.satirlar.reduce((s, x) => s + x.sonuc.ambalajSayisi, 0);

              return (
                <div key={`${grup.tarih}|${grup.urun}`} className="bg-white border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                    <div className="text-[15px] font-bold">
                      {formatDate(grup.tarih)} · {grup.urun}
                    </div>
                    <div className="text-[12px] text-text-secondary">
                      {formatSayi(toplamIhtiyac)} {birim.ambalaj} toplam · {formatSayi(toplamAmbalaj)} {birim.ambalajAdi}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[12.5px]">
                      <thead>
                        <tr className="bg-[#FAF9F4] border-b border-border">
                          <th className="text-left px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">Vana</th>
                          <th className="text-right px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">Su Tonajı</th>
                          <th className="text-right px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">Ağaç Sayısı</th>
                          <th className="text-right px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">Doz ({birim.doz})</th>
                          <th className="text-right px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">Toplam</th>
                          <th className="text-right px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">{birim.ambalajAdi === "çuval" ? "Çuval" : "Bidon"}</th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {grup.satirlar.map(({ kayit, sonuc }) => (
                          <tr key={kayit.id} className="border-b border-border-soft last:border-0">
                            <td className="px-3 py-2 font-semibold whitespace-nowrap">{kayit.vanaAdi || "—"}</td>
                            <td className="px-3 py-2 text-right">{kayit.suTonaji != null ? formatSayi(kayit.suTonaji) : "—"}</td>
                            <td className="px-3 py-2 text-right">{formatSayi(kayit.agacSayisi)}</td>
                            <td className="px-3 py-2 text-right">{formatSayi(kayit.dozAgac)}</td>
                            <td className="px-3 py-2 text-right">{formatSayi(sonuc.toplamIhtiyac)} {birim.ambalaj}</td>
                            <td className="px-3 py-2 text-right">{formatSayi(sonuc.ambalajSayisi)}</td>
                            <td className="px-3 py-2 text-right">
                              <SilButonu
                                onSil={removeFertigasyonKaydiAction.bind(null, parcel.id, kayit.id)}
                                etiket="Sil"
                                className="text-[11px] text-red font-semibold disabled:opacity-50"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {grup.satirlar[0]?.kayit.not && (
                    <div className="text-[11.5px] text-text-muted mt-2">{grup.satirlar[0].kayit.not}</div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="text-[15px] font-bold mb-1">Yeni Fertigasyon Kaydı</div>
          <div className="text-[12.5px] text-text-secondary mb-4">
            Ürünü seçip ağaç sayısı ve ağaç başına dozu girin; çuval/bidon boyutu otomatik önerilir, isterseniz
            değiştirebilirsiniz.
          </div>
          <FertigasyonForm parcelId={parcel.id} />
        </div>
      </div>
    </div>
  );
}
