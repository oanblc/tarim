import Link from "next/link";
import { recordTypes, users, degerlendirmeSorulari } from "@/lib/repositories";
import { requireUser } from "@/lib/session";
import {
  removeUserAction,
  createDegerlendirmeSorusuAction,
  updateDegerlendirmeSorusuAction,
  removeDegerlendirmeSorusuAction,
} from "@/lib/actions";
import { PlusIcon, RECORD_TYPE_ICONS, SettingsIcon } from "@/components/icons";
import { SilButonu } from "@/components/SilButonu";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { Button } from "@/components/ui/button/Button";
import { Avatar } from "@/components/ui/avatar/Avatar";

export default async function AyarlarPage() {
  const user = await requireUser();
  const [types, allUsers, sorular] = await Promise.all([recordTypes.list(), users.list(), degerlendirmeSorulari.list()]);

  return (
    <div className="p-8 lg:p-10">
      <SayfaBasligi icon={SettingsIcon} title="Ayarlar" subtitle="Kayıt tipleri ve kullanıcı hesapları" />

      <div className="bg-white border border-border rounded-2xl p-6 mb-6">
        <div className="text-[15px] font-bold mb-1">Kayıt Tipleri</div>
        <div className="text-[13px] text-text-secondary mb-4">
          Saha ziyaretlerinde girilebilen kayıt tipleri ve alanları. Yeni tip ekleme / alan düzenleme bir sonraki
          aşamada bu ekrana eklenecek.
        </div>
        <div className="grid grid-cols-3 gap-2">
          {types.map((t) => {
            const Icon = RECORD_TYPE_ICONS(t.ad);
            return (
              <div key={t.id} className="flex items-center gap-3 border border-border rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-[9px] bg-primary-bg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold">{t.ad}</div>
                  <div className="text-xs text-text-secondary truncate">
                    {t.fields.map((f) => f.label).join(" · ")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {user.rol === "admin" && (
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <div className="text-[15px] font-bold mb-1">Genel Değerlendirme Soruları</div>
          <div className="text-[13px] text-text-secondary mb-4">
            Parsel sayfasındaki, yılda bir doldurulan Genel Değerlendirme&apos;de sorulacak sorular (1-5 puan + not).
          </div>
          <div className="flex flex-col gap-2 mb-3">
            {sorular.map((s) => (
              <div key={s.id} className="flex items-center gap-2 border border-border rounded-xl px-3.5 py-2">
                <form action={updateDegerlendirmeSorusuAction.bind(null, s.id)} className="flex-1 flex items-center gap-2">
                  <input
                    name="soru"
                    defaultValue={s.soru}
                    className="flex-1 border border-transparent focus:border-border rounded-lg px-2 py-1.5 text-[13px] outline-none"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    Kaydet
                  </Button>
                </form>
                <SilButonu onSil={removeDegerlendirmeSorusuAction.bind(null, s.id)} etiket="Sil" mesaj={`"${s.soru}" sorusunu silmek istediğine emin misin?`} />
              </div>
            ))}
            {sorular.length === 0 && <div className="text-[13px] text-text-muted py-2">Henüz soru eklenmedi.</div>}
          </div>
          <form action={createDegerlendirmeSorusuAction} className="flex items-center gap-2">
            <input
              name="soru"
              required
              placeholder="Örn. Meyve rengi hoşumuza gitti mi?"
              className="flex-1 border border-border rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-primary"
            />
            <Button type="submit" size="sm" startIcon={<PlusIcon size={13} className="text-cream" />} className="whitespace-nowrap">
              Soru Ekle
            </Button>
          </form>
        </div>
      )}

      {user.rol === "admin" && (
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[15px] font-bold">Kullanıcılar</div>
            <Button href="/ayarlar/kullanici-ekle" size="sm" startIcon={<PlusIcon size={14} className="text-cream" />}>
              Kullanıcı Ekle
            </Button>
          </div>
          <div className="text-[13px] text-text-secondary mb-4">Mühendis ve yönetici hesapları.</div>
          <div className="flex flex-col gap-2">
            {allUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 border border-border rounded-xl px-4 py-3">
                <Avatar name={u.ad} size={32} variant="solid" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold">{u.ad}</div>
                  <div className="text-xs text-text-secondary">
                    {u.email} · {u.rol === "admin" ? "Yönetici" : "Ziraat Mühendisi"}
                  </div>
                </div>
                <Link href={`/ayarlar/kullanici/${u.id}/duzenle`} className="text-[11.5px] font-semibold text-primary">
                  Düzenle
                </Link>
                {u.id !== user.id && (
                  <SilButonu
                    onSil={removeUserAction.bind(null, u.id)}
                    mesaj={`${u.ad} kullanıcısını silmek istediğine emin misin?`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
