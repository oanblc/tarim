import { requireUser } from "@/lib/session";
import { topraqCiftlikleriGetir, getTopraqOverview } from "@/lib/topraq";
import { ThermometerIcon, DropletIcon } from "@/components/icons";
import { TopraqCiftlikSec } from "./TopraqCiftlikSec";

export default async function ToprakPage(props: PageProps<"/toprak">) {
  await requireUser();
  const searchParams = await props.searchParams;
  const cid = typeof searchParams.cid === "string" ? searchParams.cid : "";

  if (!process.env.TOPRAQ_USERNAME || !process.env.TOPRAQ_PASSWORD) {
    return (
      <div className="p-8 lg:p-10">
        <div className="text-[21px] font-extrabold mb-1">TOPRAQ</div>
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          TOPRAQ_USERNAME / TOPRAQ_PASSWORD tanımlı değil — bu entegrasyonun çalışması için sunucu ortam
          değişkenlerine topraq.ai hesap bilgileri eklenmeli.
        </div>
      </div>
    );
  }

  let ciftlikler: Awaited<ReturnType<typeof topraqCiftlikleriGetir>> = [];
  let hata = "";
  try {
    ciftlikler = await topraqCiftlikleriGetir();
  } catch {
    hata = "topraq.ai'ye bağlanılamadı — hesap bilgileri veya bağlantı sorunlu olabilir.";
  }

  const seciliCiftlik = cid || (ciftlikler[0] ? String(ciftlikler[0].id) : "");

  let overview: Awaited<ReturnType<typeof getTopraqOverview>> | null = null;
  if (!hata && seciliCiftlik) {
    try {
      overview = await getTopraqOverview(Number(seciliCiftlik));
    } catch {
      hata = "Bu çiftliğin verisi alınamadı.";
    }
  }

  return (
    <div className="p-8 lg:p-10">
      <div className="text-[21px] font-extrabold mb-1">TOPRAQ</div>
      <div className="text-[12.5px] text-text-secondary mb-6">
        agro.topraq.ai&apos;den canlı çekilen meteoroloji istasyonu (sıcaklık, bağıl nem) ve kök bölgesi nem
        sensörü verisi.
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 mb-6">
        <label className="block max-w-sm">
          <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Çiftlik</div>
          <TopraqCiftlikSec ciftlikler={ciftlikler} secilen={seciliCiftlik} />
        </label>
      </div>

      {hata ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">{hata}</div>
      ) : !overview ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Görmek için bir çiftlik seç.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-[13.5px] font-bold">
              <ThermometerIcon size={16} className="text-primary" />
              Meteoroloji İstasyonları
            </div>
            {overview.istasyonlar.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-8 text-center text-text-secondary text-sm">
                Bu çiftlikte hava istasyonu verisi bulunamadı.
              </div>
            ) : (
              <div className="bg-white border border-border rounded-2xl overflow-x-auto">
                <table className="w-full border-collapse text-[12.5px]">
                  <thead>
                    <tr className="bg-[#FAF9F4] border-b border-border">
                      {["Tarla", "İstasyon", "Sıcaklık", "Bağıl Nem", "Son Güncelleme"].map((h) => (
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
                    {overview.istasyonlar.map((i) => (
                      <tr key={i.deviceId} className="border-b border-border-soft last:border-0 hover:bg-cream/50">
                        <td className="px-3 py-2.5 font-bold whitespace-nowrap">{i.fieldName}</td>
                        <td className="px-3 py-2.5 text-right text-text-secondary">{i.label}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-primary">
                          {i.sicaklik !== undefined ? `${i.sicaklik}°C` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">{i.bagilNem !== undefined ? `%${i.bagilNem}` : "—"}</td>
                        <td className="px-3 py-2.5 text-right text-text-secondary whitespace-nowrap">{i.sonGuncelleme ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5 text-[13.5px] font-bold">
              <DropletIcon size={16} className="text-primary" />
              Kök Bölgesi Nem Sensörleri
            </div>
            {overview.nemSensorleri.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-8 text-center text-text-secondary text-sm">
                Bu çiftlikte nem sensörü bulunamadı.
              </div>
            ) : (
              <div className="bg-white border border-border rounded-2xl overflow-x-auto">
                <table className="w-full border-collapse text-[12.5px]">
                  <thead>
                    <tr className="bg-[#FAF9F4] border-b border-border">
                      {["Tarla", "Sensör", "Değer", "Son Güncelleme"].map((h) => (
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
                    {overview.nemSensorleri.map((n) => (
                      <tr key={n.deviceId} className="border-b border-border-soft last:border-0 hover:bg-cream/50">
                        <td className="px-3 py-2.5 font-bold whitespace-nowrap">{n.fieldName ?? "—"}</td>
                        <td className="px-3 py-2.5 text-right text-text-secondary">{n.label}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-primary">{n.degerMetni || "veri yok"}</td>
                        <td className="px-3 py-2.5 text-right text-text-secondary whitespace-nowrap">{n.sonGuncelleme ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
