import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getTopraqNemProfili } from "@/lib/topraq";
import { NemIndeksiGrafik } from "./NemIndeksiGrafik";

export default async function TopraqNemPage(props: PageProps<"/toprak/nem/[fieldId]/[deviceId]">) {
  await requireUser();
  const { fieldId, deviceId } = await props.params;
  const searchParams = await props.searchParams;
  const cid = typeof searchParams.cid === "string" ? Number(searchParams.cid) : NaN;

  if (!process.env.TOPRAQ_USERNAME || !process.env.TOPRAQ_PASSWORD || Number.isNaN(cid)) {
    return (
      <div className="p-8 lg:p-10">
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Bu sayfaya TOPRAQ üzerinden bir sensör seçerek gel.
        </div>
      </div>
    );
  }

  let profil: Awaited<ReturnType<typeof getTopraqNemProfili>> = null;
  let hata = "";
  try {
    profil = await getTopraqNemProfili(cid, Number(fieldId), Number(deviceId), 14);
  } catch {
    hata = "Bu sensörün nem profili alınamadı.";
  }

  return (
    <div className="p-8 lg:p-10">
      <div className="text-[12.5px] text-text-muted mb-1.5">
        <Link href={`/toprak?cid=${cid}`}>TOPRAQ</Link>
      </div>

      {hata || !profil ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          {hata || "Bu sensör için veri bulunamadı."}
        </div>
      ) : (
        <>
          <div className="text-[21px] font-extrabold mb-1">Ağırlıklı Kök Bölgesi Nem İndeksi</div>
          <div className="text-[12.5px] text-text-secondary mb-6">
            {profil.fieldName} &middot; {profil.deviceLabel} &mdash; son 14 gün, 2 saatlik çözünürlük.
          </div>

          <div className="bg-white border border-border rounded-2xl p-5 mb-6">
            <div className="text-[12.5px] text-text-secondary mb-4">
              Her gün, 20/40/60/80cm derinliklerinden hangisi en çok dalgalandıysa (maks&minus;min farkı en büyükse) o
              derinliğe o gün için daha fazla ağırlık verilir; bu ağırlıklar aynı günün 2 saatlik ortalamalarıyla
              çarpılıp toplanarak kalın mavi çizgideki bileşik indeks elde edilir.
            </div>
            <NemIndeksiGrafik buckets={profil.buckets} />
          </div>

          <div className="bg-white border border-border rounded-2xl overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-[#FAF9F4] border-b border-border">
                  {["Tarih", "Δ 20cm", "Δ 40cm", "Δ 60cm", "Δ 80cm", "Ağ. 20", "Ağ. 40", "Ağ. 60", "Ağ. 80", "Sulama"].map((h) => (
                    <th key={h} className="text-right first:text-left px-3 py-3 font-bold text-text-secondary uppercase tracking-wide text-[10.5px] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profil.gunler.map((g) => (
                  <tr key={g.date} className="border-b border-border-soft last:border-0 hover:bg-cream/50">
                    <td className="px-3 py-2.5 font-bold whitespace-nowrap">{g.date}</td>
                    <td className="px-3 py-2.5 text-right">{g.r20}</td>
                    <td className="px-3 py-2.5 text-right">{g.r40}</td>
                    <td className="px-3 py-2.5 text-right">{g.r60}</td>
                    <td className="px-3 py-2.5 text-right">{g.r80}</td>
                    <td className="px-3 py-2.5 text-right">%{g.w20}</td>
                    <td className="px-3 py-2.5 text-right">%{g.w40}</td>
                    <td className="px-3 py-2.5 text-right">%{g.w60}</td>
                    <td className="px-3 py-2.5 text-right">%{g.w80}</td>
                    <td className="px-3 py-2.5 text-right">
                      {g.sulama ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-bg text-primary">VAR</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
