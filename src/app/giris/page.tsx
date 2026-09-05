import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function GirisPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F7F5EF" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c6-2 8-7 8-13V5l-8-3-8 3v4c0 6 2 11 8 13Z" />
              <path d="M12 12v6" />
              <path d="M9 9c1 1 3 1 3 1s0-2-1-3-3-1-3-1 0 2 1 3Z" />
            </svg>
          </div>
          <span className="text-[17px] font-extrabold">TarlaDefteri</span>
        </div>

        <div className="bg-white border border-border rounded-2xl p-7">
          <div className="text-[17px] font-extrabold mb-1">Giriş Yap</div>
          <div className="text-[13px] text-text-secondary mb-6">Saha yönetim panelinize erişin</div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
