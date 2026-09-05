import Link from "next/link";
import { notFound } from "next/navigation";
import { getSulamaUyumuView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { createSulamaPlaniAction, removeSulamaPlaniAction } from "@/lib/actions";
import { ChevronRightIcon } from "@/components/icons";
import { SilButonu } from "@/components/SilButonu";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

const PUAN_STYLE: Record<number, string> = {
  1: "bg-primary text-cream",
  0.8: "bg-amber text-white",
  0: "bg-red text-white",
};

export default async function SulamaUyumuPage(props: PageProps<"/parseller/[id]/sulama-uyumu">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getSulamaUyumuView(id, user);
  if (!detail) notFound();
  const { parcel, customer, planlar } = detail;

  const action = createSulamaPlaniAction.bind(null, parcel.id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-2">
        <Link href="/musteriler">Müşteriler</Link>
        <ChevronRightIcon className="text-text-muted" />
        {customer && <Link href={`/musteriler/${customer.id}`}>{customer.ad}</Link>}
        <ChevronRightIcon className="text-text-muted" />
        <Link href={`/parseller/${parcel.id}`}>{parcel.ad}</Link>
        <ChevronRightIcon className="text-text-muted" />
        <span className="text-text font-bold">Sulama Uyumu</span>
      </div>
      <div className="text-[21px] font-extrabold mb-6">{parcel.ad} — Sulama Uyumu</div>

      <div className="grid grid-cols-[1fr_360px] gap-6 items-start">
        <div className="flex flex-col gap-5">
          {planlar.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
              Bu parsel için henüz sulama planı oluşturulmadı. Sağdaki formdan bir dönem tanımlayarak başlayabilirsin.
            </div>
          ) : (
            planlar.map(({ plan, sonuc }) => (
              <div key={plan.id} className="bg-white border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="text-[13.5px] font-bold">
                      {formatDate(plan.donemBaslangic)} – {formatDate(plan.donemBitis)}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">{sonuc.not}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-primary">{sonuc.skor ?? "—"}</div>
                      <div className="text-[10.5px] text-text-muted font-semibold uppercase">Puan / 10</div>
                    </div>
                    <div className="flex gap-3 text-[11.5px] text-text-secondary">
                      <span>{sonuc.planlananGunSayisi} planlanan</span>
                      <span className="text-primary font-semibold">{sonuc.tamGunSayisi} tam</span>
                      <span className="text-amber font-semibold">{sonuc.yakinGunSayisi} ±1 gün</span>
                      <span className="text-red font-semibold">{sonuc.kacirilanGunSayisi} kaçırılan</span>
                    </div>
                    <SilButonu
                      onSil={removeSulamaPlaniAction.bind(null, parcel.id, plan.id)}
                      etiket="Sil"
                      className="text-[11.5px] font-bold text-red disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {sonuc.gunler.map((g) => (
                    <div
                      key={g.tarih}
                      title={`${formatDate(g.tarih)} · puan ${g.puan}`}
                      className={`w-11 h-11 rounded-[8px] flex items-center justify-center text-[11px] font-bold ${PUAN_STYLE[g.puan]}`}
                    >
                      {formatDate(g.tarih)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="text-[15px] font-bold mb-1">Yeni Sulama Planı</div>
          <div className="text-[12.5px] text-text-secondary mb-4">
            Belirlediğin aralıkla (örn. 3 günde bir) planlanan sulama günleri otomatik oluşturulur; gerçekleşen
            sulama, bu parsele girdiğin Sulama kayıtlarının tarihinden alınır.
          </div>
          <form action={action} className="flex flex-col gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Dönem Başlangıç</div>
              <input
                name="donemBaslangic"
                type="date"
                required
                defaultValue={today}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Dönem Bitiş</div>
              <input
                name="donemBitis"
                type="date"
                required
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Kaç günde bir sulanacak</div>
              <input
                name="araGun"
                type="number"
                min={1}
                defaultValue={3}
                required
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <button type="submit" className="mt-1 px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
              Planı Oluştur
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
