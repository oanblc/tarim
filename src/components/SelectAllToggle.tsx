"use client";

export function SelectAllToggle({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 text-[12px] font-bold">
      <button
        type="button"
        className="text-primary hover:underline"
        onClick={(e) => {
          const form = e.currentTarget.closest("form");
          form?.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((el) => (el.checked = true));
        }}
      >
        Tümünü Seç
      </button>
      <span className="text-border">·</span>
      <button
        type="button"
        className="text-text-secondary hover:underline"
        onClick={(e) => {
          const form = e.currentTarget.closest("form");
          form?.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((el) => (el.checked = false));
        }}
      >
        Temizle
      </button>
    </div>
  );
}
