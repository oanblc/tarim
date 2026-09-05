import Link from "next/link";
import { notFound } from "next/navigation";
import { getIsiToplamiView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { createIsiHaftasiAction, updateIsiHaftasiAction, removeIsiHaftasiAction } from "@/lib/actions";
import { ChevronRightIcon, ThermometerIcon } from "@/components/icons";
import { GDD_BASE_TEMP_VARSAYILAN } from "@/lib/tarim";
import { HavaDurumuCekForm } from "@/components/HavaDurumuCekForm";
import { SilButonu } from "@/components/SilButonu";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function IsiToplamiPage(props: PageProps<"/musteriler/[id]/isi-toplami">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getIsiToplamiView(id, user);
  if (!detail) notFound();
  const { customer, haftalar, konumluParselVar } = detail;

  const searchParams = await props.searchParams;
  const duzenleId = typeof searchParams.duzenle === "string" ? searchParams.duzenle : "";
  const duzenlenen = haftalar.find((h) => h.hafta.id === duzenleId)?.hafta;

  const action = duzenlenen
    ? updateIsiHaftasiAction.bind(null, customer.id, duzenlenen.id)
    : createIsiHaftasiAction.bind(null, customer.id);
  const sonKumulatif = haftalar[0]?.kumulatifGdd;

  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-2">
        <Link href="/musteriler">Müşteriler</Link>
        <ChevronRightIcon className="text-text-muted" />
        <Link href={`/musteriler/${customer.id}`}>{customer.ad}</Link>
        <ChevronRightIcon className="text-text-muted" />
        <span className="text-text font-bold">Isı Toplamı</span>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <div className="text-[21px] font-extrabold">{customer.ad} — Isı Toplamı (GDD)</div>
        <span className="text-[11.5px] text-text-secondary bg-cream border border-border px-2.5 py-1 rounded-full font-semibold">
          Baz sıcaklık {GDD_BASE_TEMP_VARSAYILAN}°C
        </span>
      </div>

      {!konumluParselVar && (
        <div className="flex items-center justify-between gap-3 bg-amber-bg border border-amber rounded-2xl px-5 py-3.5 mb-6 flex-wrap">
          <span className="text-[12.5px] font-semibold text-amber">
            Bu müşterinin haritada konumu çizilmiş hiçbir parseli yok — &quot;Otomatik Çek&quot; bu yüzden çalışmaz.
            Manuel giriş yapabilir veya bir parselin sınırını haritada çizerek konum tanımlayabilirsin.
          </span>
          <Link href={`/musteriler/${customer.id}`} className="text-[12.5px] font-bold text-amber shrink-0 hover:underline">
            Parsellere git →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-border rounded-2xl p-6 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-bg flex items-center justify-center">
              <ThermometerIcon size={20} className="text-primary" />
            </div>
            <div>
              <div className="text-[26px] font-extrabold">{sonKumulatif ?? "—"}</div>
              <div className="text-xs text-text-secondary font-semibold">Güncel kümülatif GDD</div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_0.8fr_1fr_100px] px-5 py-3 border-b border-border bg-[#FAF9F4]">
              <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Hafta</span>
              <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Ort. Sıc.</span>
              <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Haftalık GDD</span>
              <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Kümülatif</span>
              <span className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wide">Yağış / Nem</span>
              <span />
            </div>

            {haftalar.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-text-secondary">
                Henüz iklim kaydı eklenmedi.
              </div>
            ) : (
              haftalar.map(({ hafta, haftalikGdd, kumulatifGdd }) => (
                <div
                  key={hafta.id}
                  className={`grid grid-cols-[1.1fr_0.8fr_0.9fr_0.8fr_1fr_100px] items-center px-5 py-3 border-b border-border-soft last:border-0 ${
                    hafta.id === duzenleId ? "bg-primary-bg" : ""
                  }`}
                >
                  <span className="text-[13px] font-bold">{formatDate(hafta.haftaBaslangic)}</span>
                  <span className="text-[13px] text-text-secondary">{hafta.ortSicaklik ?? "—"}°C</span>
                  <span className="text-[13px] text-text-secondary">{haftalikGdd ?? "—"}</span>
                  <span className="text-[13px] font-bold text-primary">{kumulatifGdd ?? "—"}</span>
                  <span className="text-[13px] text-text-secondary">
                    {hafta.yagis ?? "—"} mm / %{hafta.nem ?? "—"}
                  </span>
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/musteriler/${customer.id}/isi-toplami?duzenle=${hafta.id}`}
                      className="text-[11px] font-bold text-primary"
                    >
                      Düzenle
                    </Link>
                    <SilButonu
                      onSil={removeIsiHaftasiAction.bind(null, customer.id, hafta.id)}
                      etiket="Sil"
                      className="text-[11px] font-bold text-red disabled:opacity-50"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          {!duzenlenen && <HavaDurumuCekForm customerId={customer.id} />}

          <div className="text-[15px] font-bold mb-1">{duzenlenen ? "Haftayı Düzenle" : "Haftayı Elle Ekle"}</div>
          <div className="text-[12.5px] text-text-secondary mb-4">
            Ortalama sıcaklığı girersen haftalık GDD otomatik hesaplanır. Raporda doğrudan bir kümülatif değer
            verildiyse onu da ayrıca girebilirsin — hesaplananın yerine o gösterilir.
          </div>
          <form action={action} className="flex flex-col gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Hafta Başlangıcı</div>
              <input
                name="haftaBaslangic"
                type="date"
                required
                defaultValue={duzenlenen?.haftaBaslangic}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ort °C</div>
                <input
                  name="ortSicaklik"
                  type="number"
                  step="0.1"
                  defaultValue={duzenlenen?.ortSicaklik}
                  className="w-full border border-border rounded-[9px] px-3 py-2.5 text-[13px] outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Min °C</div>
                <input
                  name="minSicaklik"
                  type="number"
                  step="0.1"
                  defaultValue={duzenlenen?.minSicaklik}
                  className="w-full border border-border rounded-[9px] px-3 py-2.5 text-[13px] outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Maks °C</div>
                <input
                  name="maksSicaklik"
                  type="number"
                  step="0.1"
                  defaultValue={duzenlenen?.maksSicaklik}
                  className="w-full border border-border rounded-[9px] px-3 py-2.5 text-[13px] outline-none focus:border-primary"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Yağış (mm)</div>
                <input
                  name="yagis"
                  type="number"
                  step="0.1"
                  defaultValue={duzenlenen?.yagis}
                  className="w-full border border-border rounded-[9px] px-3 py-2.5 text-[13px] outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Nem (%)</div>
                <input
                  name="nem"
                  type="number"
                  step="0.1"
                  defaultValue={duzenlenen?.nem}
                  className="w-full border border-border rounded-[9px] px-3 py-2.5 text-[13px] outline-none focus:border-primary"
                />
              </label>
            </div>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Rapordaki Kümülatif GDD (opsiyonel)</div>
              <input
                name="rapordakiKumulatifGdd"
                type="number"
                step="0.1"
                defaultValue={duzenlenen?.rapordakiKumulatifGdd}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <div className="flex items-center gap-2.5">
              {duzenlenen && (
                <Link
                  href={`/musteriler/${customer.id}/isi-toplami`}
                  className="px-5 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
                >
                  Vazgeç
                </Link>
              )}
              <button type="submit" className="flex-1 mt-1 px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
                {duzenlenen ? "Kaydet" : "Haftayı Ekle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
