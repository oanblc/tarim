import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { Backdrop } from "@/components/Backdrop";
import { MainContent } from "@/components/MainContent";
import { SidebarProvider } from "@/context/SidebarContext";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TarlaDefteri",
  description: "Ziraat mühendisleri için saha takip ve raporlama paneli",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="tr" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full h-full font-sans text-[15px] text-text">
        {user ? (
          <SidebarProvider>
            <Sidebar user={{ ad: user.ad, rol: user.rol }} />
            <Backdrop />
            <MainContent>{children}</MainContent>
          </SidebarProvider>
        ) : (
          <div className="h-screen overflow-y-auto">{children}</div>
        )}
      </body>
    </html>
  );
}
