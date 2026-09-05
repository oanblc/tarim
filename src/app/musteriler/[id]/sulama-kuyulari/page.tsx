import Link from "next/link";
import { notFound } from "next/navigation";
import { getSulamaKuyulariView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { createSulamaKuyusuAction, removeSulamaKuyusuAction, updateSulamaKuyusuAction } from "@/lib/actions";
import { ChevronRightIcon } from "@/components/icons";
import { SilButonu } from "@/components/SilButonu";

export default async function SulamaKuyulariPage(props: PageProps<"/musteriler/[id]/sulama-kuyulari">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getSulamaKuyulariView(id, user);
  if (!detail) notFound();
  const { customer, kuyular, kuyusuzParseller } = detail;

  const action = createSulamaKuyusuAction.bind(null, customer.id);

  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-2">
        <Link href="/musteriler">Müşteriler</Link>
        <ChevronRightIcon className="text-text-muted" />
        <Link href={`/musteriler/${customer.id}`}>{customer.ad}</Link>
        <ChevronRightIcon className="text-text-muted" />
        <span className="text-text font-bold">Sulama Kuyuları</span>
      </div>
      <div className="text-[21px] font-extrabold mb-1">{customer.ad} — Sulama Kuyuları</div>
      <div className="text-[12.5px] text-text-secondary mb-6">
        Aynı kuyudan/vanadan sulanan parselleri gruplayarak Sulama Raporu&apos;nda birlikte göster.
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
        <div className="flex flex-col gap-3">
          {kuyular.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
              Henüz sulama kuyusu tanımlanmadı. Sağdaki formdan ekleyebilirsin.
            </div>
          ) : (
            kuyular.map(({ kuyu, parseller }) => (
              <div key={kuyu.id} className="bg-white border border-border rounded-2xl p-5">
                <form action={updateSulamaKuyusuAction.bind(null, customer.id, kuyu.id)} className="flex items-end gap-2 mb-3 flex-wrap">
                  <label className="block flex-1 min-w-[160px]">
                    <div className="text-[11px] font-bold text-[#4A4F45] mb-1">Kuyu / Vana Adı</div>
                    <input
                      name="ad"
                      required
                      defaultValue={kuyu.ad}
                      className="w-full border border-border rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block flex-1 min-w-[160px]">
                    <div className="text-[11px] font-bold text-[#4A4F45] mb-1">Not</div>
                    <input
                      name="not"
                      defaultValue={kuyu.not}
                      className="w-full border border-border rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-primary"
                    />
                  </label>
                  <button type="submit" className="px-3.5 py-2 rounded-[8px] bg-primary text-cream text-[12px] font-bold whitespace-nowrap">
                    Kaydet
                  </button>
                </form>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">Bağlı Parseller</span>
                  <SilButonu
                    onSil={removeSulamaKuyusuAction.bind(null, customer.id, kuyu.id)}
                    etiket="Kuyuyu Sil"
                    className="text-[11.5px] text-red font-semibold disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parseller.length === 0 ? (
                    <span className="text-[11.5px] text-text-muted">Henüz atanmış parsel yok.</span>
                  ) : (
                    parseller.map((p) => (
                      <Link
                        key={p.id}
                        href={`/parseller/${p.id}`}
                        className="text-[11.5px] font-semibold bg-primary-bg text-[#4A4F45] px-2.5 py-1 rounded-full hover:text-primary"
                      >
                        {p.ad}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ))
          )}

          {kuyusuzParseller.length > 0 && (
            <div className="bg-cream border border-dashed border-border rounded-2xl p-5">
              <div className="text-[13px] font-bold mb-2">Kuyusu Belirtilmemiş Parseller</div>
              <div className="flex flex-wrap gap-1.5">
                {kuyusuzParseller.map((p) => (
                  <Link
                    key={p.id}
                    href={`/parseller/${p.id}/duzenle`}
                    className="text-[11.5px] font-semibold bg-white border border-border px-2.5 py-1 rounded-full hover:text-primary hover:border-primary"
                  >
                    {p.ad} — kuyu ata
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="text-[15px] font-bold mb-1">Yeni Kuyu Ekle</div>
          <div className="text-[12.5px] text-text-secondary mb-4">
            Ekledikten sonra parsel ekleme/düzenleme sayfasından parselleri bu kuyuya atayabilirsin.
          </div>
          <form action={action} className="flex flex-col gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Kuyu / Vana Adı</div>
              <input
                name="ad"
                required
                placeholder="Örn. m.emin bahçe"
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Not (opsiyonel)</div>
              <textarea
                name="not"
                rows={2}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary resize-none"
              />
            </label>
            <button type="submit" className="mt-1 px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
              Kuyuyu Ekle
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
