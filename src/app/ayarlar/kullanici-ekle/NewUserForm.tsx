"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createUserAction, type CreateUserState } from "@/lib/actions";

const initialState: CreateUserState = null;

export function NewUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Ad Soyad</div>
        <input
          name="ad"
          required
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">E-posta</div>
        <input
          name="email"
          type="email"
          required
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
        />
      </label>

      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Geçici Şifre</div>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
        />
        <div className="text-[11.5px] text-text-muted mt-1.5">En az 6 karakter. Kullanıcı ilk girişte kendisi değiştiremiyor henüz — bunu iletmeyi unutmayın.</div>
      </label>

      <div>
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-2">Rol</div>
        <div className="flex gap-2">
          <label className="flex-1 flex items-center gap-2 border border-border rounded-[9px] px-3.5 py-2.5 cursor-pointer has-checked:border-primary has-checked:bg-primary-bg">
            <input type="radio" name="rol" value="muhendis" defaultChecked className="accent-primary" />
            <span className="text-[13px] font-semibold">Ziraat Mühendisi</span>
          </label>
          <label className="flex-1 flex items-center gap-2 border border-border rounded-[9px] px-3.5 py-2.5 cursor-pointer has-checked:border-primary has-checked:bg-primary-bg">
            <input type="radio" name="rol" value="admin" className="accent-primary" />
            <span className="text-[13px] font-semibold">Yönetici</span>
          </label>
        </div>
      </div>

      {state?.error && <div className="text-[12.5px] text-red bg-red-bg rounded-[9px] px-3.5 py-2.5">{state.error}</div>}

      <div className="flex gap-2.5 justify-end pt-2">
        <Link
          href="/ayarlar"
          className="px-5 py-2.5 rounded-[10px] border border-border text-[13.5px] font-bold text-[#4A4F45]"
        >
          Vazgeç
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold disabled:opacity-60"
        >
          {pending ? "Ekleniyor..." : "Kullanıcıyı Ekle"}
        </button>
      </div>
    </form>
  );
}
