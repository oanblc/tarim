"use client";

import { useState } from "react";
import { StarIcon } from "@/components/icons";

// 1-5 yıldız puan seçici — tıklanan yıldıza kadar dolar, seçilen değer bir
// hidden input üzerinden normal form gönderimine dahil olur.
export function PuanSecici({ name, baslangic = 0 }: { name: string; baslangic?: number }) {
  const [puan, setPuan] = useState(baslangic);
  const [hover, setHover] = useState(0);
  const gosterilen = hover || puan;

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={puan} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setPuan(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
        >
          <StarIcon size={20} filled={n <= gosterilen} className={n <= gosterilen ? "text-amber" : "text-border"} />
        </button>
      ))}
    </div>
  );
}
