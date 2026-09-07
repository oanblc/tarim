import { ReactNode } from "react";
import Link from "next/link";

// TailAdmin'den uyarlandı (github.com/TailAdmin/free-nextjs-admin-dashboard).
// Mekanik (variant/size/ikon yerleşimi) aynı kaldı; renkler TailAdmin'in
// mavi `brand-*` skalası yerine TarlaDefteri'nin kendi yeşil `primary`
// token'ına, boyutlar da uygulamada zaten kullanılan buton ölçülerine
// (örn. "Yeni Müşteri" — px-[18px] py-2.5) uyarlandı. `href` verilirse bir
// sayfa içi link olarak render edilir (uygulamadaki "aksiyon butonları"nın
// çoğu aslında bir sayfaya yönlendirme).
type ButtonProps = {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
};

export function Button(
  props: ButtonProps & ({ href: string; onClick?: never; type?: never; disabled?: never } | { href?: undefined; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }),
) {
  const { children, size = "md", variant = "primary", startIcon, endIcon, className = "" } = props;

  const sizeClasses = {
    sm: "px-4 py-2 text-[12.5px]",
    md: "px-[18px] py-2.5 text-sm",
  };

  const variantClasses = {
    primary: "bg-primary text-cream shadow-theme-xs hover:bg-primary/90 disabled:bg-primary/40",
    outline:
      "bg-white text-[#4A4F45] ring-1 ring-inset ring-border hover:bg-cream dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };

  const disabled = "disabled" in props && props.disabled;
  const classes = `inline-flex items-center justify-center font-bold gap-2 rounded-[10px] transition ${className} ${sizeClasses[size]} ${variantClasses[variant]} ${
    disabled ? "cursor-not-allowed opacity-50" : ""
  }`;

  const content = (
    <>
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {content}
      </Link>
    );
  }

  const { onClick, type = "button" } = props as { onClick?: () => void; type?: "button" | "submit" };
  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
