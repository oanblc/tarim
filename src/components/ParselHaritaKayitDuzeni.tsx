"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

// Harita alanını açıp kapatabilmek için: harita kapalıyken kayıt/görev
// paneli tüm genişliği kullanır. Harita bir Mapbox örneği tuttuğu için
// gizlenince tamamen unmount edilir (0 genişlikte boşta durmasın diye).
export function ParselHaritaKayitDuzeni({ harita, kayitPaneli }: { harita: ReactNode; kayitPaneli: ReactNode }) {
  const [haritaAcik, setHaritaAcik] = useState(true);

  return (
    <div className="flex-1 flex overflow-hidden">
      {haritaAcik && <div className="flex-1 relative overflow-hidden border-r border-border">{harita}</div>}

      <button
        type="button"
        onClick={() => setHaritaAcik((v) => !v)}
        title={haritaAcik ? "Haritayı gizle" : "Haritayı göster"}
        className="w-6 shrink-0 flex items-center justify-center border-r border-border bg-cream hover:bg-primary-bg text-text-secondary hover:text-primary"
      >
        {haritaAcik ? <ChevronLeftIcon size={13} /> : <ChevronRightIcon size={13} />}
      </button>

      <div className={haritaAcik ? "w-[430px] min-w-[430px] h-full overflow-y-auto p-6" : "flex-1 h-full overflow-y-auto p-6"}>
        {kayitPaneli}
      </div>
    </div>
  );
}
