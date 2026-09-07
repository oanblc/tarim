"use client";

import { useId, useState } from "react";
import { PlusIcon, XIcon } from "@/components/icons";

// Çeşit/Anaç gibi "birden fazla olabilir" alanlar için: mevcut değerler chip
// olarak listelenir, "+ Ekle" bir açılır kutu gösterip yeni bir değer eklemeyi
// sağlar (autocomplete ile). Sonuç, form gönderiminde JSON dizisi olarak
// hidden input'a yazılır (bkz. actions.ts jsonDiziAyikla).
export function CokluSecimEkle({
  name,
  baslangic = [],
  oneriler,
  placeholder,
}: {
  name: string;
  baslangic?: string[];
  oneriler: string[];
  placeholder?: string;
}) {
  const [degerler, setDegerler] = useState<string[]>(baslangic);
  const [acik, setAcik] = useState(false);
  const [taslak, setTaslak] = useState("");
  const listId = useId();
  const benzersizOneriler = Array.from(new Set(oneriler.filter(Boolean)));

  const ekle = () => {
    const deger = taslak.trim();
    if (!deger || degerler.includes(deger)) {
      setTaslak("");
      setAcik(false);
      return;
    }
    setDegerler((d) => [...d, deger]);
    setTaslak("");
    setAcik(false);
  };

  const sil = (deger: string) => setDegerler((d) => d.filter((x) => x !== deger));

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(degerler)} />
      <div className="flex flex-wrap gap-1.5 items-center">
        {degerler.map((d) => (
          <span key={d} className="flex items-center gap-1.5 bg-primary-bg text-primary text-[12.5px] font-semibold px-2.5 py-1 rounded-full">
            {d}
            <button type="button" onClick={() => sil(d)} className="hover:opacity-60">
              <XIcon size={10} />
            </button>
          </span>
        ))}

        {acik ? (
          <span className="flex items-center gap-1">
            <input
              autoFocus
              list={listId}
              value={taslak}
              onChange={(e) => setTaslak(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  ekle();
                }
                if (e.key === "Escape") {
                  setTaslak("");
                  setAcik(false);
                }
              }}
              placeholder={placeholder}
              className="border border-primary rounded-full px-3 py-1 text-[12.5px] outline-none w-40"
            />
            <datalist id={listId}>
              {benzersizOneriler.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
            <button type="button" onClick={ekle} className="text-[11.5px] font-bold text-primary px-1.5">
              Ekle
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setAcik(true)}
            className="flex items-center gap-1 text-[12px] font-bold text-primary border border-dashed border-primary/50 rounded-full px-2.5 py-1"
          >
            <PlusIcon size={11} />
            Ekle
          </button>
        )}
      </div>
    </div>
  );
}
