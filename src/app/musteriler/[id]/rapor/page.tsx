import Link from "next/link";
import { notFound } from "next/navigation";
import { customers } from "@/lib/repositories";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { ChevronRightIcon, ReportsIcon } from "@/components/icons";

const SECENEKLER = (customerId: string) => [
  {
    href: `/musteriler/${customerId}/rapor/genel`,
    baslik: "Genel Rapor",
    aciklama: "Dönem seç, parselleri işaretle, mühendis notu ekleyip taslak oluştur — gönderilebilir/PDF alınabilir rapor.",
  },
  {
    href: `/raporlar/haftalik-rapor?musteriId=${customerId}`,
    baslik: "Haftalık Rapor",
    aciklama: "Tarih, parsel seçip ilaç reçetesi, fenolojik dönem ve durum gir.",
  },
  {
    href: `/raporlar/sulama-raporu?musteriId=${customerId}`,
    baslik: "Sulama Raporu",
    aciklama: "Son 7 günün sulama saatlerini kuyu bazında gör ve düzenle.",
  },
  {
    href: `/raporlar/haftalik-ozet?musteriId=${customerId}`,
    baslik: "Haftalık Özet",
    aciklama: "Isı Toplamı, sulama ve tüm uygulama sayılarının hafta hafta panoraması.",
  },
];

export default async function RaporSecPage(props: PageProps<"/musteriler/[id]/rapor">) {
  const { id } = await props.params;
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === id);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) notFound();

  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[900px]">
        <div className="text-[12.5px] text-text-muted mb-1.5">
          <Link href={`/musteriler/${customer.id}`}>{customer.ad}</Link>
        </div>
        <div className="text-[21px] font-extrabold mb-1">Hangi Raporu Oluşturacaksın?</div>
        <div className="text-[13px] text-text-secondary mb-6">Bir rapor türü seç, {customer.ad} için devam et.</div>

        <div className="grid grid-cols-2 gap-4">
          {SECENEKLER(customer.id).map((secenek) => (
            <Link
              key={secenek.href}
              href={secenek.href}
              className="bg-white border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary"
            >
              <div className="w-10 h-10 rounded-[10px] bg-primary-bg flex items-center justify-center shrink-0">
                <ReportsIcon size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold">{secenek.baslik}</div>
                <div className="text-[12px] text-text-secondary mt-0.5">{secenek.aciklama}</div>
              </div>
              <ChevronRightIcon size={15} className="text-text-muted shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
