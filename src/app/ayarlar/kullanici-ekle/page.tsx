import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { NewUserForm } from "./NewUserForm";

export default async function KullaniciEklePage() {
  const user = await requireUser();
  if (user.rol !== "admin") notFound();

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[480px]">
        <div className="text-[12.5px] text-text-muted mb-1.5">Ayarlar</div>
        <div className="text-[21px] font-extrabold mb-6">Kullanıcı Ekle</div>

        <div className="bg-white border border-border rounded-2xl p-7">
          <NewUserForm />
        </div>
      </div>
    </div>
  );
}
