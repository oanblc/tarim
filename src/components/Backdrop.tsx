"use client";

import { useSidebar } from "@/context/SidebarContext";

// Mobilde sidebar açıkken içeriğin üstüne düşen karartma — üzerine
// tıklamak sidebar'ı kapatır (TailAdmin'in Backdrop'undan uyarlandı).
export function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  if (!isMobileOpen) return null;

  return (
    <div
      onClick={toggleMobileSidebar}
      className="fixed inset-0 z-40 bg-black/40 lg:hidden"
    />
  );
}
