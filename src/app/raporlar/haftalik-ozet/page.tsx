import Link from "next/link";
import { getCustomersView, getHaftalikOzetView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { MusteriSecOtomatik } from "@/components/MusteriSecOtomatik";

function formatGun(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
}

export default async function HaftalikOzetPage(props: PageProps<"/raporlar/haftalik-ozet">) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const musteriId = typeof searchParams.musteriId === "string" ? searchParams.musteriId : "";

  const musteriler = (await getCustomersView(user)).map((m) => m.customer);
  const view = musteriId ? await getHaftalikOzetView(musteriId, user) : null;

  return (
    <div className="p-8 lg:p-10">
      <div className="text-[12.5px] text-text-muted mb-1.5">
        <Link href="/raporlar">Raporlar</Link>
      </div>
      <div className="text-[21px] font-extrabold mb-[22px]">Haftalık Özet</div>

      <div className="bg-white border border-border rounded-2xl p-5 mb-6">
        <label className="block max-w-xs">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Müşteri</div>
          <MusteriSecOtomatik musteriler={musteriler} secilen={musteriId} hedefYol="/raporlar/haftalik-ozet" />
        </label>
      </div>

      {!musteriId ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Özeti görmek için önce bir müşteri seç.
        </div>
      ) : !view ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Bu müşteriye erişimin yok.
        </div>
      ) : view.haftalar.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm flex flex-col items-center gap-3">
          <span>
            Bu müşteri için henüz ısı verisi yok — bir parselin sınırı haritada çizilince otomatik oluşur, veya
            elle bir Isı Toplamı haftası tanımlayabilirsin.
          </span>
          <Link
            href={`/musteriler/${musteriId}/isi-toplami`}
            className="px-4 py-2 rounded-[9px] bg-primary text-cream text-[12.5px] font-bold"
          >
            Isı Toplamı Haftası Ekle →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-x-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#FAF9F4] border-b border-border">
                {["Hafta", "Ort. Sıcaklık", "Haftalık GDD", "Kümülatif GDD", "Sulama (saat)", "Sulama Günü", "Gübre Uyg.", "Yaprak Gübre", "İlaç Uyg.", "Saha Tespiti"].map((h) => (
                  <th key={h} className="text-right first:text-left px-3 py-3 font-bold text-text-secondary uppercase tracking-wide text-[10.5px] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.haftalar.map(({ hafta, haftalikGdd, kumulatifGdd, sulamaSaat, sulamaGunu, gubreUygulama, yaprakGubresi, ilacUygulama, sahaTespiti }) => (
                <tr key={hafta.id} className="border-b border-border-soft last:border-0 hover:bg-cream/50">
                  <td className="px-3 py-2.5 font-bold whitespace-nowrap">{formatGun(hafta.haftaBaslangic)}</td>
                  <td className="px-3 py-2.5 text-right">{hafta.ortSicaklik ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right">{haftalikGdd ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-primary">{kumulatifGdd ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right">{sulamaSaat || "—"}</td>
                  <td className="px-3 py-2.5 text-right">{sulamaGunu || "—"}</td>
                  <td className="px-3 py-2.5 text-right">{gubreUygulama || "—"}</td>
                  <td className="px-3 py-2.5 text-right">{yaprakGubresi || "—"}</td>
                  <td className="px-3 py-2.5 text-right">{ilacUygulama || "—"}</td>
                  <td className="px-3 py-2.5 text-right">{sahaTespiti || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
