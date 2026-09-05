import Link from "next/link";
import { recordTypes, users } from "@/lib/repositories";
import { requireUser } from "@/lib/session";
import { removeUserAction } from "@/lib/actions";
import { PlusIcon, RECORD_TYPE_ICONS, SettingsIcon } from "@/components/icons";
import { SilButonu } from "@/components/SilButonu";
import { SayfaBasligi } from "@/components/SayfaBasligi";

export default async function AyarlarPage() {
  const user = await requireUser();
  const [types, allUsers] = await Promise.all([recordTypes.list(), users.list()]);

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
