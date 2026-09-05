import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getGorevlerView } from "@/lib/queries";
import { GorevDurumSelect } from "@/components/GorevDurumSelect";
import { SilButonu } from "@/components/SilButonu";
import { removeGorevAction } from "@/lib/actions";
import { ClipboardIcon, PlusIcon, UsersIcon } from "@/components/icons";
import { SayfaBasligi } from "@/components/SayfaBasligi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function GorevlerPage() {
  const user = await requireUser();
  const rows = await getGorevlerView(user);

  const acikSayisi = rows.filter((r) => r.gorev.durum !== "tamamlandi").length;

  return (
    <div className="p-8 lg:p-10">
      <SayfaBasligi
        icon={ClipboardIcon}
        title="Görevler"
        subtitle={`${rows.length} görev · ${acikSayisi} açık`}
        action={
          <Link
            href="/gorevler/yeni"
            className="flex items-center gap-2 bg-primary text-cream px-[18px] py-2.5 rounded-[10px] text-sm font-bold"
          >
            <PlusIcon className="text-cream" />
            Yeni Görev
          </Link>
        }
      />

      {rows.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center text-text-secondary text-sm">
          Henüz görev eklenmedi.{" "}
          <Link href="/gorevler/yeni" className="text-primary font-semibold">
            Yeni Görev
          </Link>{" "}
          ile müşteri ve parsel seçip başlayabilirsin.
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          {rows.map(({ gorev, parcel, customer, sorumlu }) => (
            <div key={gorev.id} className="flex items-start gap-4 px-5 py-4 border-b border-border-soft last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-[11.5px] font-bold text-primary bg-primary-bg px-2.5 py-0.5 rounded-full">
                    {gorev.konu}
                  </span>
                  {customer && (
                    <Link href={`/musteriler/${customer.id}`} className="text-[12.5px] font-bold text-[#4A4F45] hover:underline">
                      {customer.ad}
                    </Link>
                  )}
                  {parcel && (
                    <>
                      <span className="text-text-muted text-xs">·</span>
                      <Link href={`/parseller/${parcel.id}`} className="text-[12.5px] font-semibold text-text-secondary hover:underline">
                        {parcel.ad}
                      </Link>
                    </>
                  )}
                </div>
                <div className="text-[13px] text-[#4A4F45]">{gorev.gozlem}</div>
                {gorev.onerilenUygulama && (
                  <div className="text-xs text-text-secondary mt-1">→ {gorev.onerilenUygulama}</div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-text-muted">
                    {formatDate(gorev.tarih)}
                    {gorev.terminTarihi && ` · Termin: ${formatDate(gorev.terminTarihi)}`}
                  </span>
                  {sorumlu && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-blue bg-blue-bg px-2 py-0.5 rounded-full">
                      <UsersIcon size={11} className="text-blue" />
                      {sorumlu.ad}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <GorevDurumSelect gorevId={gorev.id} parcelId={gorev.parcelId} durum={gorev.durum} />
                <div className="flex items-center gap-2.5">
                  {parcel && (
                    <Link href={`/parseller/${parcel.id}/gorev/${gorev.id}/duzenle`} className="text-[11px] font-bold text-primary">
                      Düzenle
                    </Link>
                  )}
                  <SilButonu
                    onSil={removeGorevAction.bind(null, gorev.id, gorev.parcelId)}
                    etiket="Sil"
                    className="text-[11px] font-bold text-red disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
