import { ReactNode } from "react";

// TailAdmin'den uyarlandı — renkler TailAdmin'in kendi success/error/warning
// skalası yerine TarlaDefteri'nin zaten her yerde kullandığı primary/blue/
// amber/red token çiftlerine bağlandı (GOREV_DURUM_STYLE, RAPOR_TUR_STYLE
// ile aynı paleti kullanır, bkz. src/components/icons.tsx).
export function Badge({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}: {
  variant?: "light" | "solid";
  size?: "sm" | "md";
  color?: "primary" | "success" | "error" | "warning" | "info" | "light";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children: ReactNode;
}) {
  const baseStyles = "inline-flex items-center justify-center gap-1 rounded-full font-bold";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10.5px]",
    md: "px-2.5 py-1 text-[11.5px]",
  };

  const variants = {
    light: {
      primary: "bg-primary-bg text-primary",
      success: "bg-primary-bg text-primary",
      error: "bg-red-bg text-red",
      warning: "bg-amber-bg text-amber",
      info: "bg-blue-bg text-blue",
      light: "bg-cream text-text-secondary",
    },
    solid: {
      primary: "bg-primary text-cream",
      success: "bg-primary text-cream",
      error: "bg-red text-cream",
      warning: "bg-amber text-cream",
      info: "bg-blue text-cream",
      light: "bg-border text-text",
    },
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variants[variant][color]}`}>
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </span>
  );
}
