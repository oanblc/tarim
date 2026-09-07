import type { Parcel } from "@/types";

// Eski kayıtlarda tek bir `urun` string'i vardı, yenilerde `cesitler` dizisi
// var — ikisini tek bir listeye indirger (görüntüleme için).
export function parselCesitleri(parcel: Pick<Parcel, "cesitler" | "urun">): string[] {
  if (parcel.cesitler && parcel.cesitler.length > 0) return parcel.cesitler;
  return parcel.urun ? [parcel.urun] : [];
}

// Ağaç sayısı ve alandan (dönüm) ortalama ağaç başına alanı ve buna karşılık
// gelen yaklaşık kare dikim aralığını hesaplar — mühendis artık aralığı elle
// girmiyor, ağaç sayısını giriyor ve aralık buradan türetiliyor.
export function agacAraligiHesapla(alanDonum: number, agacSayisi: number): { m2PerAgac: number; araligiM: number } | null {
  if (!alanDonum || !agacSayisi) return null;
  const m2PerAgac = (alanDonum * 1000) / agacSayisi;
  const araligiM = Math.sqrt(m2PerAgac);
  return { m2PerAgac: Math.round(m2PerAgac * 10) / 10, araligiM: Math.round(araligiM * 10) / 10 };
}

export type ParselOnerileri = {
  bolge: string[];
  ad: string[];
  cesit: string[];
  anac: string[];
  sulamaSekli: string[];
};
