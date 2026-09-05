"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions";

const initialState: LoginState = null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">E-posta</div>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
        />
      </label>
      <label className="block">
        <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">Şifre</div>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
        />
      </label>

      {state?.error && <div className="text-[12.5px] text-red bg-red-bg rounded-[9px] px-3.5 py-2.5">{state.error}</div>}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
