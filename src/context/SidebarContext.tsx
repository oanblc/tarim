"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

// TailAdmin'in SidebarContext'inden uyarlandı (Faz 2 — geçiş haritası).
// Masaüstünde daralt/genişlet + üzerine gelince geçici genişleme, mobilde
// (lg altı) tam ekran overlay olarak açılıp kapanma sağlar.
type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const guncelle = () => {
      const mobil = window.innerWidth < 1024;
      setIsMobile(mobil);
      if (!mobil) setIsMobileOpen(false);
    };
    guncelle();
    window.addEventListener("resize", guncelle);
    return () => window.removeEventListener("resize", guncelle);
  }, []);

  const toggleSidebar = useCallback(() => setIsExpanded((v) => !v), []);
  const toggleMobileSidebar = useCallback(() => setIsMobileOpen((v) => !v), []);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        isMobile,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar bir SidebarProvider içinde kullanılmalı.");
  return ctx;
}
