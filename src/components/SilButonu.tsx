"use client";

import { useState, useTransition } from "react";

// Silme işlemi bir hata döndürebiliyorsa (ör. "son yönetici silinemez") ve
// sayfa yönlendirmiyorsa kullanılan genel amaçlı silme butonu: onay ister,
// hatayı yerinde gösterir, başarılıysa sayfayı tazeler.
export function SilButonu({
  onSil,
  mesaj = "Silmek istediğine emin misin?",
  etiket = "Sil",
  className = "text-[11.5px] text-red font-semibold disabled:opacity-50",
}: {
  onSil: () => Promise<{ ok: true } | { ok: false; error: string } | void>;
  mesaj?: string;
  etiket?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const tikla = () => {
    if (!window.confirm(mesaj)) return;
    setHata(null);
    startTransition(async () => {
      const sonuc = await onSil();
      if (sonuc && sonuc.ok === false) {
        setHata(sonuc.error);
        return;
      }
      // router.refresh() arama parametreli (?...) rotalarda güncel veriyi
      // güvenilir şekilde yansıtmıyor (Next 16'nın router cache davranışı) —
      // tam sayfa yenileme burada daha sağlam.
      window.location.reload();
    });
  };

  return (
    <div>
      <button type="button" onClick={tikla} disabled={pending} className={className}>
        {pending ? "Siliniyor…" : etiket}
      </button>
      {hata && <div className="text-[11px] text-red mt-1">{hata}</div>}
    </div>
  );
}
