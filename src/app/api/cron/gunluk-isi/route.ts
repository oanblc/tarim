import { NextRequest, NextResponse } from "next/server";
import { tumMusterilerIcinGunlukIsiGuncelle } from "@/lib/isiGunluk";

// Günlük ısı verisini tüm müşteriler için güncelleyen worker uç noktası.
// Railway Cron Job (veya cron-job.org gibi harici bir zamanlayıcı) bunu
// günde bir kez çağırır: GET /api/cron/gunluk-isi?secret=<CRON_SECRET>
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const sonuclar = await tumMusterilerIcinGunlukIsiGuncelle(3);
  return NextResponse.json({ ok: true, musteriSayisi: sonuclar.length, sonuclar });
}
