import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { users } from "@/lib/repositories";
import { EditUserForm } from "./EditUserForm";

export default async function KullaniciDuzenlePage(props: PageProps<"/ayarlar/kullanici/[id]/duzenle">) {
  const { id } = await props.params;
  const currentUser = await requireUser();
  if (currentUser.rol !== "admin") notFound();

  const hedefKullanici = (await users.list()).find((u) => u.id === id);
  if (!hedefKullanici) notFound();

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[480px]">
        <div className="text-[12.5px] text-text-muted mb-1.5">Ayarlar</div>
        <div className="text-[21px] font-extrabold mb-6">Kullanıcıyı Düzenle</div>

        <div className="bg-white border border-border rounded-2xl p-7">
          <EditUserForm user={hedefKullanici} kendisiMi={hedefKullanici.id === currentUser.id} />
        </div>
      </div>
    </div>
  );
}
