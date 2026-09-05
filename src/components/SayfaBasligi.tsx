import type { ReactNode } from "react";

type IkonBileseni = (props: { size?: number; className?: string }) => ReactNode;

// Liste sayfalarının üst başlık alanı için ortak, ikonlu ve arkaplanlı kart —
// Müşteriler, Parseller, Kayıtlar, Görevler, Raporlar arasında hem görsel hem
// yükseklik tutarlılığı sağlar (sabit dolgu + sabit ikon kutusu boyutu).
export function SayfaBasligi({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: IkonBileseni;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap bg-gradient-to-br from-primary-bg to-cream border border-border rounded-2xl px-6 py-5 mb-6 min-h-[84px]">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-[12px] bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-black/10">
          <Icon size={20} className="text-cream" />
        </div>
        <div>
          <div className="text-[21px] font-extrabold leading-tight">{title}</div>
          {subtitle && <div className="text-[13px] text-text-secondary mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}
