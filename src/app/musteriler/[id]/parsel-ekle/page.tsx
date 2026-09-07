import { notFound } from "next/navigation";
import { customers, sulamaKuyulari } from "@/lib/repositories";
import { requireUser, canAccessCustomer } from "@/lib/session";
import { createParcelAction } from "@/lib/actions";
import { ParselEkleWizard } from "./ParselEkleWizard";

export default async function ParselEklePage(props: PageProps<"/musteriler/[id]/parsel-ekle">) {
  const { id } = await props.params;
  const user = await requireUser();
  const customer = (await customers.list()).find((c) => c.id === id);
  if (!customer || !canAccessCustomer(user, customer.sorumluMuhendisId)) notFound();
  const kuyular = await sulamaKuyulari.listByCustomer(id);

  const action = createParcelAction.bind(null, id);

  return <ParselEkleWizard customerId={id} customerAd={customer.ad} kuyular={kuyular} action={action} />;
}
