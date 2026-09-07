"use client";

import type { ReactNode } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { AppHeader } from "@/components/AppHeader";

// Sidebar'ın genişliğine göre sol boşluğu ayarlayan içerik alanı — Sidebar
// genişse/hover'daysa 232px, daraltılmışsa 90px, mobilde (sidebar overlay
// olduğu için) hep 0. `min-h-0`, flex sütununda iç scroll'un çalışması için
// gerekli (aksi halde overflow-y-auto etkisiz kalır).
export function MainContent({ children }: { children: ReactNode }) {
  const { isExpanded, isHovered, isMobile } = useSidebar();
  const genisletilmisMi = !isMobile && (isExpanded || isHovered);

  return (
    <div
      className={`flex flex-col h-screen transition-[margin] duration-300 ease-in-out ${
        genisletilmisMi ? "lg:ml-[232px]" : "lg:ml-[90px]"
      }`}
    >
      <AppHeader />
      <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
    </div>
  );
}
