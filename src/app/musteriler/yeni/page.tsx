import { createCustomerAction } from "@/lib/actions";

export default function YeniMusteriPage() {
  return (
    <div className="p-8 lg:p-10">
      <div className="w-full max-w-[560px]">
        <div className="text-[21px] font-extrabold mb-6">Yeni Müşteri</div>

        <form action={createCustomerAction} className="bg-white border border-border rounded-2xl p-7 flex flex-col gap-4">
          <Field label="Müşteri / İşletme Adı" name="ad" required />
          <Field label="Telefon" name="telefon" />
          <Field label="E-posta" name="email" type="email" />
          <Field label="Adres" name="adres" />

          <div className="flex gap-2.5 justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-[10px] bg-primary text-cream text-[13.5px] font-bold"
            >
              Müşteriyi Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-[12.5px] font-bold text-[#4A4F45] mb-1.5">{label}</div>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
      />
    </label>
  );
}
