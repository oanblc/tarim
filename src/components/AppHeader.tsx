"use client";

import { useSidebar } from "@/context/SidebarContext";
import { MenuIcon, PanelLeftIcon } from "@/components/icons";

// Sidebar'ın üstünde, mobilde hamburger ile aç/kapa, masaüstünde daralt/
// genişlet düğmesi taşıyan ince üst bar (TailAdmin'in AppHeader'ından
// uyarlandı — arama/bildirim gibi karşılığı olmayan bölümler eklenmedi).
export function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 bg-white border-b border-border px-4 lg:px-6">
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-cream shrink-0"
        aria-label="Menüyü aç"
      >
        <MenuIcon size={20} />
      </button>
      <button
        type="button"
        onClick={toggleSidebar}
        className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-text-secondary hover:bg-cream shrink-0"
        aria-label="Menüyü daralt/genişlet"
      >
        <PanelLeftIcon size={18} />
      </button>
    </header>
  );
}
