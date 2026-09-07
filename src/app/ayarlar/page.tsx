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
import { Badge } from "@/components/ui/badge/Badge";

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
        <div className="bg-white border border-dashed border-blue rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[15px] font-bold">Tasarım Pilotu — TailAdmin</div>
            <span className="text-[10.5px] font-bold text-blue bg-blue-bg px-2 py-0.5 rounded-full">DENEME</span>
          </div>
          <div className="text-[13px] text-text-secondary mb-4">
            TailAdmin&apos;den taşınan Button/Badge bileşenleri — henüz hiçbir yerde kullanılmıyor, sadece görsel
            karşılaştırma için. Beğenirsen sırayla gerçek ekranlara (Sidebar/Header, formlar, tablolar) yayılır.
          </div>

          <div className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-2">Button</div>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <Button>Kaydet</Button>
            <Button size="sm">Kaydet (sm)</Button>
            <Button variant="outline">Vazgeç</Button>
            <Button disabled>Devre Dışı</Button>
          </div>

          <div className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-2">Badge</div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">Primary</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="error">Error</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="info">Info</Badge>
            <Badge variant="solid" color="primary">
              Solid Primary
            </Badge>
            <Badge variant="solid" color="success">
              Solid Success
            </Badge>
          </div>
        </div>
      )}

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
                  <button type="submit" className="text-[11.5px] font-bold text-primary shrink-0">
                    Kaydet
                  </button>
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
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2.5 rounded-[9px] bg-primary text-cream text-[12.5px] font-bold whitespace-nowrap">
              <PlusIcon size={13} className="text-cream" />
              Soru Ekle
            </button>
          </form>
        </div>
      )}

      {user.rol === "admin" && (
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[15px] font-bold">Kullanıcılar</div>
            <Link href="/ayarlar/kullanici-ekle" className="flex items-center gap-1.5 text-[12.5px] font-bold text-primary">
              <PlusIcon size={14} className="text-primary" />
              Kullanıcı Ekle
            </Link>
          </div>
          <div className="text-[13px] text-text-secondary mb-4">Mühendis ve yönetici hesapları.</div>
          <div className="flex flex-col gap-2">
            {allUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 border border-border rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-primary text-cream flex items-center justify-center text-xs font-bold shrink-0">
                  {u.ad
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
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
