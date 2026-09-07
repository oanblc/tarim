import Link from "next/link";
import { notFound } from "next/navigation";
import { getParcelDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { saveParselDegerlendirmeAction } from "@/lib/actions";
import { PuanSecici } from "@/components/PuanSecici";

export default async function ParselDegerlendirmePage(props: PageProps<"/parseller/[id]/degerlendirme">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getParcelDetail(id, user);
  if (!detail) notFound();
  const { parcel, degerlendirmeSorulari, degerlendirmeler } = detail;

  const buYil = String(new Date().getFullYear());
  const mevcut = degerlendirmeler.find((d) => d.yil === buYil);
  const action = saveParselDegerlendirmeAction.bind(null, parcel.id, buYil);

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[560px]">
        <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-1.5">
          <Link href={`/parseller/${parcel.id}?sekme=degerlendirme`}>{parcel.ad}</Link>
          <span>/</span>
          <span className="text-text font-bold">Genel Değerlendirme</span>
        </div>
        <div className="text-[21px] font-extrabold mb-1">{buYil} Genel Değerlendirmesi</div>
        <div className="text-[12.5px] text-text-secondary mb-6">Her soruya 1-5 puan ver, istersen altına kısa bir not ekle.</div>

        {degerlendirmeSorulari.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
            Henüz bir değerlendirme sorusu tanımlanmadı —{" "}
            <Link href="/ayarlar" className="text-primary font-semibold">
              Ayarlar
            </Link>
            &apos;dan ekleyebilirsin.
          </div>
        ) : (
          <form action={action} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-5">
            {degerlendirmeSorulari.map((soru) => {
              const cevap = mevcut?.cevaplar.find((c) => c.soruId === soru.id);
              return (
                <div key={soru.id} className="flex flex-col gap-2 pb-5 border-b border-border-soft last:border-0 last:pb-0">
                  <div className="text-[13.5px] font-bold text-[#4A4F45]">{soru.soru}</div>
                  <PuanSecici name={`puan_${soru.id}`} baslangic={cevap?.puan ?? 0} />
                  <textarea
                    name={`not_${soru.id}`}
                    defaultValue={cevap?.not}
                    placeholder="Not (opsiyonel)"
                    rows={2}
                    className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary resize-none"
                  />
                </div>
              );
            })}

            <div className="flex justify-end gap-2.5">
              <Link
                href={`/parseller/${parcel.id}?sekme=degerlendirme`}
                className="px-5 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
              >
                Vazgeç
              </Link>
              <button type="submit" className="px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
                Kaydet
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
