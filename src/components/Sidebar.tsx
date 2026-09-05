"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { HomeIcon, UsersIcon, MapIcon, RecordsIcon, ReportsIcon, SettingsIcon, ClipboardIcon } from "./icons";

const NAV_ITEMS = [
  { href: "/", label: "Pano", icon: HomeIcon, match: (p: string) => p === "/" },
  { href: "/musteriler", label: "Müşteriler", icon: UsersIcon, match: (p: string) => p.startsWith("/musteriler") },
  { href: "/parseller", label: "Parseller", icon: MapIcon, match: (p: string) => p.startsWith("/parseller") },
  { href: "/kayitlar", label: "Kayıtlar", icon: RecordsIcon, match: (p: string) => p.startsWith("/kayitlar") },
  { href: "/gorevler", label: "Görevler", icon: ClipboardIcon, match: (p: string) => p.startsWith("/gorevler") },
  { href: "/raporlar", label: "Raporlar", icon: ReportsIcon, match: (p: string) => p.startsWith("/raporlar") },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar({ user }: { user: { ad: string; rol: "admin" | "muhendis" } }) {
  const pathname = usePathname();

  return (
    <div className="w-[232px] min-w-[232px] h-screen bg-forest flex flex-col p-4">
      <div className="flex items-center gap-2.5 px-2 pb-7">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F7F5EF" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c6-2 8-7 8-13V5l-8-3-8 3v4c0 6 2 11 8 13Z" />
            <path d="M12 12v6" />
            <path d="M9 9c1 1 3 1 3 1s0-2-1-3-3-1-3-1 0 2 1 3Z" />
          </svg>
        </div>
        <div>
          <div className="text-cream font-bold text-[15px] leading-tight">TarlaDefteri</div>
          <div className="text-forest-muted text-[11px]">Saha Yönetim Paneli</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                active ? "bg-forest-active text-cream font-semibold" : "text-[#B7C0AF] font-medium hover:text-cream"
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5">
        <Link
          href="/ayarlar"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
            pathname.startsWith("/ayarlar") ? "bg-forest-active text-cream font-semibold" : "text-[#B7C0AF] font-medium hover:text-cream"
          }`}
        >
          <SettingsIcon size={19} />
          <span>Ayarlar</span>
        </Link>

        <div className="flex items-center gap-2.5 px-2 pt-3 pb-2 border-t border-forest-active mt-2">
          <div className="w-8 h-8 rounded-full bg-primary text-cream flex items-center justify-center text-[13px] font-bold shrink-0">
            {initialsOf(user.ad)}
          </div>
          <div className="min-w-0">
            <div className="text-cream text-[13px] font-semibold leading-tight truncate">{user.ad}</div>
            <div className="text-forest-muted text-[11px]">{user.rol === "admin" ? "Yönetici" : "Ziraat Mühendisi"}</div>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#B7C0AF] font-medium hover:text-cream text-left"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span>Çıkış Yap</span>
          </button>
        </form>
      </div>
    </div>
  );
}
