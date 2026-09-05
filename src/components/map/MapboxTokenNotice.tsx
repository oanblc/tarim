export function MapboxTokenNotice() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#2A3324]">
      <div className="bg-white rounded-2xl p-6 max-w-[360px] text-center shadow-xl shadow-black/20">
        <div className="text-[14px] font-bold mb-1.5">Harita token&apos;ı eksik</div>
        <div className="text-[12.5px] text-text-secondary leading-relaxed">
          Haritanın çalışması için <code className="bg-cream px-1.5 py-0.5 rounded text-[11.5px]">.env.local</code>{" "}
          dosyasına <code className="bg-cream px-1.5 py-0.5 rounded text-[11.5px]">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
          değişkeni eklenmeli.
        </div>
      </div>
    </div>
  );
}
