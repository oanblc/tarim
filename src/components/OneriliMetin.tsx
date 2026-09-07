import { useId } from "react";

// Native <datalist> tabanlı basit autocomplete — tarayıcı klavye/fare
// gezinmesini bedavaya getirir, ekstra bir dropdown kütüphanesi gerekmez.
// `oneriler` genelde aynı müşterinin diğer parsellerinden derlenen değerler.
// id'ler için useId kullanılıyor — modül seviyesinde artan bir sayaç sunucu
// render'ı ile istemci hydration'ı arasında farklı değerler üretip React'in
// hydration mismatch uyarısına yol açıyordu.
export function OneriliMetin({
  name,
  defaultValue,
  placeholder,
  oneriler,
  required,
  className,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  oneriler: string[];
  required?: boolean;
  className?: string;
}) {
  const listId = useId();
  const benzersiz = Array.from(new Set(oneriler.filter(Boolean)));

  return (
    <>
      <input
        name={name}
        list={listId}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={
          className ??
          "w-full border border-border rounded-[9px] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
        }
      />
      <datalist id={listId}>
        {benzersiz.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}
