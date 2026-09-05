import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getCustomersView, getSulamaRaporuView } from "@/lib/queries";
import { MusteriSecOtomatik } from "@/components/MusteriSecOtomatik";
import { SulamaHucre } from "@/components/SulamaHucre";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

function formatGun(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
}

function isoBugun() {
  return new Date().toISOString().slice(0, 10);
}

function isoGunEkle(iso: string, gun: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + gun);
  return d.toISOString().slice(0, 10);
}

export default async function SulamaRaporuPage(props: PageProps<"/raporlar/sulama-raporu">) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const musteriId = typeof searchParams.musteriId === "string" ? searchParams.musteriId : "";
  const hafta = typeof searchParams.hafta === "string" ? parseInt(searchParams.hafta, 10) || 0 : 0;

  // Tarih seçtirmiyoruz — müşteri seçilince o haftanın son 7 günü otomatik
  // gösterilir, ok tuşlarıyla hafta hafta geri/ileri gidilir. Hücreye
  // tıklayıp değer girildiğinde ilgili gün için kayıt oluşur/güncellenir.
  const bitis = isoGunEkle(isoBugun(), hafta * 7);
  const baslangic = isoGunEkle(bitis, -6);

  const musteriler = (await getCustomersView(user)).map((m) => m.customer);
  const rapor = musteriId ? await getSulamaRaporuView(musteriId, baslangic, bitis, user) : null;

  const haftaHref = (yeniHafta: number) => `/raporlar/sulama-raporu?musteriId=${musteriId}&hafta=${yeniHafta}`;

  return (
    <div className="p-8 lg:p-10">
      <div className="text-[12.5px] text-text-muted mb-1.5">
        <Link href="/raporlar">Raporlar</Link>
      </div>
      <div className="text-[21px] font-extrabold mb-[22px]">Sulama Raporu</div>

      <div className="bg-white border border-border rounded-2xl p-5 mb-6 flex items-end justify-between gap-4 flex-wrap">
        <label className="block">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Müşteri</div>
          <MusteriSecOtomatik musteriler={musteriler} secilen={musteriId} hedefYol="/raporlar/sulama-raporu" />
        </label>

        {musteriId && (
          <div className="flex items-center gap-3">
            <Link
              href={haftaHref(hafta - 1)}
              className="w-9 h-9 rounded-[9px] border border-border flex items-center justify-center hover:border-primary hover:text-primary"
            >
              <ChevronLeftIcon size={15} />
            </Link>
            <div className="text-[13px] font-bold min-w-[150px] text-center">
              {formatGun(baslangic)} – {formatGun(bitis)}
            </div>
            <Link
              href={haftaHref(hafta + 1)}
              className="w-9 h-9 rounded-[9px] border border-border flex items-center justify-center hover:border-primary hover:text-primary"
            >
              <ChevronRightIcon size={15} />
            </Link>
          </div>
        )}
      </div>

      {!musteriId ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Raporu görmek için önce bir müşteri seç.
        </div>
      ) : !rapor ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Bu müşteriye erişimin yok.
        </div>
      ) : rapor.gruplar.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Bu müşteriye ait parsel yok.
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-x-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#FAF9F4] border-b border-border">
                <th className="sticky left-0 bg-[#FAF9F4] text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wide text-[11px] whitespace-nowrap border-r border-border">
                  Sulama Kuyusu
                </th>
                <th className="sticky left-[150px] bg-[#FAF9F4] text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wide text-[11px] whitespace-nowrap border-r border-border">
                  Parsel Adı
                </th>
                {rapor.tarihler.map((t) => (
                  <th key={t} className="px-3 py-3 font-bold text-text-secondary text-[11px] whitespace-nowrap text-center">
                    {formatGun(t)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rapor.gruplar.map(({ kuyu, satirlar }) =>
                satirlar.map(({ parcel, saatler }, i) => (
                  <tr key={parcel.id} className="border-b border-border-soft last:border-0 hover:bg-cream/50">
                    <td className="sticky left-0 bg-white px-4 py-2 font-bold text-[#4A4F45] whitespace-nowrap border-r border-border">
                      {i === 0 ? kuyu : ""}
                    </td>
                    <td className="sticky left-[150px] bg-white px-4 py-2 font-semibold whitespace-nowrap border-r border-border">
                      <Link href={`/parseller/${parcel.id}`} className="hover:text-primary hover:underline">
                        {parcel.ad}
                      </Link>
                    </td>
                    {rapor.tarihler.map((t) => (
                      <td key={t} className="px-1 py-1 text-center">
                        <SulamaHucre parcelId={parcel.id} tarih={t} ilkDeger={saatler[t]} />
                      </td>
                    ))}
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
