import Link from "next/link";
import { notFound } from "next/navigation";
import { getBeslenmeProgramiView } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import {
  createBeslenmePlaniAction,
  updateBeslenmePlaniAction,
  removeBeslenmePlaniAction,
  createBeslenmeUygulamaAction,
  removeBeslenmeUygulamaAction,
} from "@/lib/actions";
import { URUN_BIRIM_PARSEL, type BeslenmeUrun } from "@/lib/beslenme";
import { ChevronRightIcon } from "@/components/icons";
import { SilButonu } from "@/components/SilButonu";
import { HesaplamaMantigiButonu } from "@/components/HesaplamaMantigiButonu";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function formatSayi(n: number) {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
}

const URUN_URUNLER: BeslenmeUrun[] = ["AS21", "MAP", "K2SO4", "H3PO4"];

export default async function BeslenmeProgramiPage(props: PageProps<"/parseller/[id]/beslenme">) {
  const { id } = await props.params;
  const user = await requireUser();
  const detail = await getBeslenmeProgramiView(id, user);
  if (!detail) notFound();
  const { parcel, customer, planlar } = detail;

  const searchParams = await props.searchParams;
  const duzenleId = typeof searchParams.duzenle === "string" ? searchParams.duzenle : "";
  const duzenlenenPlan = planlar.find((p) => p.plan.id === duzenleId)?.plan;

  const planAction = duzenlenenPlan
    ? updateBeslenmePlaniAction.bind(null, parcel.id, duzenlenenPlan.id)
    : createBeslenmePlaniAction.bind(null, parcel.id);
  const sezonVarsayilan = String(new Date().getFullYear());

  return (
    <div className="p-8 lg:p-10">
      <div className="flex items-center gap-1.5 text-[12.5px] text-text-muted mb-2">
        <Link href="/musteriler">Müşteriler</Link>
        <ChevronRightIcon className="text-text-muted" />
        {customer && <Link href={`/musteriler/${customer.id}`}>{customer.ad}</Link>}
        <ChevronRightIcon className="text-text-muted" />
        <Link href={`/parseller/${parcel.id}`}>{parcel.ad}</Link>
        <ChevronRightIcon className="text-text-muted" />
        <span className="text-text font-bold">Beslenme Programı</span>
      </div>
      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
        <div className="text-[21px] font-extrabold">{parcel.ad} — Beslenme Programı</div>
        <HesaplamaMantigiButonu />
      </div>
      <div className="text-[12.5px] text-text-secondary mb-6">
        Hedef azot oranı ve hedef N:P:K besin oranından, sezona yayılmış ürün dozu ve toplam alım miktarı otomatik
        hesaplanır.
      </div>

      {!parcel.alanDonum && (
        <div className="flex items-center justify-between gap-3 bg-amber-bg border border-amber rounded-2xl px-5 py-3.5 mb-6 flex-wrap">
          <span className="text-[12.5px] font-semibold text-amber">
            Bu parselin alanı (dönüm) tanımlı değil — sezonluk toplam alım miktarı bu yüzden 0 çıkacaktır. Ağaç
            başına dozlar yine de doğru hesaplanır.
          </span>
          <Link href={`/parseller/${parcel.id}/duzenle`} className="text-[12.5px] font-bold text-amber shrink-0 hover:underline">
            Alanı gir →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-[1fr_360px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          {planlar.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
              Bu parsel için henüz beslenme planı oluşturulmadı. Sağdaki formdan bir sezon tanımlayarak başlayabilirsin.
            </div>
          ) : (
            planlar.map(({ plan, sonuc, uygulamalar }) => {
              const uygulamaAction = createBeslenmeUygulamaAction.bind(null, parcel.id, plan.id);
              const donemler = Array.from(new Set(sonuc.satirlar.map((s) => s.donem)));

              return (
                <div key={plan.id} className="bg-white border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
                    <div className="text-[15px] font-bold">{plan.sezon} Sezonu</div>
                    <div className="flex items-center gap-4 text-[11.5px] text-text-secondary">
                      <span>Hedef N: {plan.hedefAzotKgHa} kg/ha</span>
                      <span>N:P:K = {plan.hedefN}:{plan.hedefP}:{plan.hedefK}</span>
                      <span>{plan.agacSayisiHa} ağaç/ha</span>
                      <Link href={`/parseller/${parcel.id}/beslenme?duzenle=${plan.id}`} className="font-bold text-primary">
                        Düzenle
                      </Link>
                      <SilButonu
                        onSil={removeBeslenmePlaniAction.bind(null, parcel.id, plan.id)}
                        etiket="Sil"
                        className="font-bold text-red disabled:opacity-50"
                      />
                    </div>
                  </div>
                  {plan.not && <div className="text-xs text-text-secondary mb-3">{plan.not}</div>}

                  <div className="text-[11px] font-bold uppercase tracking-wide text-text-muted mt-4 mb-2">
                    Uygulama Takvimi (ağaç başına)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[12.5px]">
                      <thead>
                        <tr className="bg-[#FAF9F4] border-b border-border">
                          <th className="text-left px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">Dönem</th>
                          <th className="text-right px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">AS21</th>
                          <th className="text-right px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">MAP</th>
                          <th className="text-right px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">H3PO4</th>
                          <th className="text-right px-3 py-2 font-bold text-text-secondary uppercase tracking-wide text-[10.5px]">K2SO4</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donemler.map((donem) => {
                          const satirlar = sonuc.satirlar.filter((s) => s.donem === donem);
                          const gr = (urun: BeslenmeUrun) => satirlar.find((s) => s.urun === urun);
                          return (
                            <tr key={donem} className="border-b border-border-soft last:border-0">
                              <td className="px-3 py-2 font-semibold whitespace-nowrap">{donem}</td>
                              <td className="px-3 py-2 text-right">{gr("AS21") ? `${formatSayi(gr("AS21")!.dozAgac)} g` : "—"}</td>
                              <td className="px-3 py-2 text-right">{gr("MAP") ? `${formatSayi(gr("MAP")!.dozAgac)} g` : "—"}</td>
                              <td className="px-3 py-2 text-right">{gr("H3PO4") ? `${formatSayi(gr("H3PO4")!.dozAgac)} cc` : "—"}</td>
                              <td className="px-3 py-2 text-right">{gr("K2SO4") ? `${formatSayi(gr("K2SO4")!.dozAgac)} g` : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[11px] font-bold uppercase tracking-wide text-text-muted mt-5 mb-2">
                    Sezonluk Toplam Alım Miktarı ({formatSayi(sonuc.alanHa)} ha · {formatSayi(sonuc.toplamAgac)} ağaç)
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {URUN_URUNLER.map((urun) => (
                      <div key={urun} className="bg-cream rounded-xl p-3 text-center">
                        <div className="text-[10.5px] font-bold text-text-muted uppercase">{urun}</div>
                        <div className="text-[16px] font-extrabold text-primary mt-0.5">
                          {formatSayi(sonuc.toplamUrunParsel[urun] ?? 0)}
                        </div>
                        <div className="text-[10.5px] text-text-muted">{URUN_BIRIM_PARSEL[urun]}</div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] font-bold uppercase tracking-wide text-text-muted mt-6 mb-2">
                    Gerçekleşen Uygulamalar
                  </div>
                  {uygulamalar.length === 0 ? (
                    <div className="text-[12px] text-text-muted mb-3">Henüz uygulama girilmedi.</div>
                  ) : (
                    <div className="flex flex-col gap-1.5 mb-3">
                      {uygulamalar.map((u) => (
                        <div key={u.id} className="flex items-center justify-between bg-cream/60 rounded-[8px] px-3 py-1.5 text-[12px]">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{formatDate(u.tarih)}</span>
                            <span className="text-text-secondary">{u.urun} · {formatSayi(u.miktarKg)} kg</span>
                            {u.not && <span className="text-text-muted">{u.not}</span>}
                          </div>
                          <SilButonu
                            onSil={removeBeslenmeUygulamaAction.bind(null, parcel.id, u.id)}
                            etiket="Sil"
                            className="text-[11px] text-red font-semibold disabled:opacity-50"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <form action={uygulamaAction} className="flex items-end gap-2 flex-wrap">
                    <label className="block">
                      <div className="text-[11px] font-bold text-[#4A4F45] mb-1">Tarih</div>
                      <input name="tarih" type="date" required className="border border-border rounded-[8px] px-2.5 py-2 text-[12.5px] outline-none focus:border-primary" />
                    </label>
                    <label className="block">
                      <div className="text-[11px] font-bold text-[#4A4F45] mb-1">Ürün</div>
                      <select name="urun" required className="border border-border rounded-[8px] px-2.5 py-2 text-[12.5px] outline-none focus:border-primary">
                        {URUN_URUNLER.map((urun) => (
                          <option key={urun} value={urun}>{urun}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <div className="text-[11px] font-bold text-[#4A4F45] mb-1">Miktar (kg)</div>
                      <input name="miktarKg" type="number" step="0.1" min={0} required className="w-28 border border-border rounded-[8px] px-2.5 py-2 text-[12.5px] outline-none focus:border-primary" />
                    </label>
                    <label className="block flex-1 min-w-[140px]">
                      <div className="text-[11px] font-bold text-[#4A4F45] mb-1">Not (opsiyonel)</div>
                      <input name="not" type="text" className="w-full border border-border rounded-[8px] px-2.5 py-2 text-[12.5px] outline-none focus:border-primary" />
                    </label>
                    <button type="submit" className="px-4 py-2 rounded-[8px] bg-primary text-cream text-[12.5px] font-bold">
                      Ekle
                    </button>
                  </form>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="text-[15px] font-bold mb-1">{duzenlenenPlan ? "Planı Düzenle" : "Yeni Beslenme Planı"}</div>
          <div className="text-[12.5px] text-text-secondary mb-4">
            Hedeflenen meyve verimine göre belirlediğin saf azot dozunu (kg/ha) ve bu çeşit için hedeflediğin N:P:K
            oranını gir; AS21/MAP/K2SO4/H3PO4 dozları ve sezonluk toplam alım miktarı otomatik hesaplanır.
          </div>
          <form action={planAction} className="flex flex-col gap-4">
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Sezon</div>
              <input
                name="sezon"
                type="text"
                required
                defaultValue={duzenlenenPlan?.sezon ?? sezonVarsayilan}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Hedef Azot (kg/ha/yıl)</div>
              <input
                name="hedefAzotKgHa"
                type="number"
                step="0.1"
                min={0}
                required
                defaultValue={duzenlenenPlan?.hedefAzotKgHa}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">N</div>
                <input name="hedefN" type="number" step="0.1" min={0} required defaultValue={duzenlenenPlan?.hedefN ?? 100} className="w-full border border-border rounded-[9px] px-3 py-2.5 text-[13px] outline-none focus:border-primary" />
              </label>
              <label className="block">
                <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">P</div>
                <input name="hedefP" type="number" step="0.1" min={0} required defaultValue={duzenlenenPlan?.hedefP} className="w-full border border-border rounded-[9px] px-3 py-2.5 text-[13px] outline-none focus:border-primary" />
              </label>
              <label className="block">
                <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">K</div>
                <input name="hedefK" type="number" step="0.1" min={0} required defaultValue={duzenlenenPlan?.hedefK} className="w-full border border-border rounded-[9px] px-3 py-2.5 text-[13px] outline-none focus:border-primary" />
              </label>
            </div>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ağaç Sayısı / ha</div>
              <input
                name="agacSayisiHa"
                type="number"
                step="1"
                min={1}
                required
                defaultValue={duzenlenenPlan?.agacSayisiHa}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Not (opsiyonel)</div>
              <textarea
                name="not"
                rows={2}
                defaultValue={duzenlenenPlan?.not}
                className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary resize-none"
              />
            </label>
            <div className="flex items-center gap-2.5">
              {duzenlenenPlan && (
                <Link
                  href={`/parseller/${parcel.id}/beslenme`}
                  className="px-5 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
                >
                  Vazgeç
                </Link>
              )}
              <button type="submit" className="flex-1 mt-1 px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold">
                {duzenlenenPlan ? "Kaydet" : "Planı Oluştur"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
