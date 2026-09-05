import Link from "next/link";
import { getCustomersView, getIsiGunluguView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { MusteriSecOtomatik } from "@/components/MusteriSecOtomatik";
import { IsiGunluguCekButonu } from "@/components/IsiGunluguCekButonu";

function formatGun(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "UTC" });
}

export default async function IsiGunluguPage(props: PageProps<"/raporlar/isi-gunlugu">) {
  const user = await requireUser();
  const searchParams = await props.searchParams;
  const musteriId = typeof searchParams.musteriId === "string" ? searchParams.musteriId : "";

  const musteriler = (await getCustomersView(user)).map((m) => m.customer);
  const view = musteriId ? await getIsiGunluguView(musteriId, user) : null;

  return (
    <div className="p-8 lg:p-10">
      <div className="text-[12.5px] text-text-muted mb-1.5">
        <Link href="/raporlar">Raporlar</Link>
      </div>
      <div className="text-[21px] font-extrabold mb-1">Isı Günlüğü</div>
      <div className="text-[12.5px] text-text-secondary mb-6">
        Open-Meteo&apos;dan otomatik çekilen günlük sıcaklık ve yağış takibi — her gün için ayrı satır.
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 mb-6 flex items-end justify-between gap-4 flex-wrap">
        <label className="block max-w-xs">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Müşteri</div>
          <MusteriSecOtomatik musteriler={musteriler} secilen={musteriId} hedefYol="/raporlar/isi-gunlugu" />
        </label>
        {musteriId && <IsiGunluguCekButonu customerId={musteriId} />}
      </div>

      {!musteriId ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Günlüğü görmek için önce bir müşteri seç.
        </div>
      ) : !view ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Bu müşteriye erişimin yok.
        </div>
      ) : view.gunler.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Bu müşteri için henüz günlük ısı verisi çekilmedi — yukarıdaki &quot;Son 30 Günü Çek&quot; ile başlayabilirsin.
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-x-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#FAF9F4] border-b border-border">
                {["Tarih", "Ort. Sıcaklık", "Min", "Maks", "Yağış (mm)"].map((h) => (
                  <th
                    key={h}
                    className="text-right first:text-left px-3 py-3 font-bold text-text-secondary uppercase tracking-wide text-[10.5px] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.gunler.map((gun) => (
                <tr key={gun.id} className="border-b border-border-soft last:border-0 hover:bg-cream/50">
                  <td className="px-3 py-2.5 font-bold whitespace-nowrap capitalize">{formatGun(gun.tarih)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-primary">{gun.ortSicaklik ?? "—"}°C</td>
                  <td className="px-3 py-2.5 text-right">{gun.minSicaklik ?? "—"}°C</td>
                  <td className="px-3 py-2.5 text-right">{gun.maksSicaklik ?? "—"}°C</td>
                  <td className="px-3 py-2.5 text-right">{gun.yagis ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
