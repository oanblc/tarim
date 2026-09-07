// Ortak baş harf avatarı — daha önce Sidebar, Ayarlar, Müşteriler ve Müşteri
// Detayı sayfalarında ayrı ayrı yazılmış aynı `.split(" ").map(w => w[0])`
// mantığını birleştirir (biri 2 harfle sınırlamıyordu, burada düzeltildi).
// Köşe yarıçapı class yerine inline style ile veriliyor — arbitrary-value
// Tailwind class'ları (rounded-[10px] vs rounded-full) aynı özgüllükte
// olduğundan className ile öngörülebilir biçimde override edilemiyor.
export function Avatar({
  name,
  size = 38,
  variant = "light",
  radius,
  className = "",
}: {
  name: string;
  size?: number;
  variant?: "light" | "solid";
  radius?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const renk = variant === "solid" ? "bg-primary text-cream" : "bg-primary-bg text-primary";
  const borderRadius = radius ?? (variant === "solid" ? 9999 : 10);

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.34, borderRadius }}
      className={`${renk} flex items-center justify-center font-bold shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
