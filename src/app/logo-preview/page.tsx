import Image from "next/image";

const concepts = [
  { src: "/logos/shark-concept-1-fin.svg", title: "1 — Shark Fin + Yıldız", desc: "En güçlü öneri. Yüzgeç = Shark, altın yıldız = zabit rütbesi, 2 dalga = deniz. App icon olarak net okunur." },
  { src: "/logos/shark-concept-2-s.svg", title: "2 — S Monogram", desc: "Modern / tech duruş. S = Shark, üstteki turkuaz yüzgeç detayı. Altın çember = mühür / sertifika hissi." },
  { src: "/logos/shark-concept-3-compass.svg", title: "3 — Pusula Shark", desc: "Seyir vurgusu. Pusula gülü + köpekbalığı silüeti. Vardiya zabiti / seyir kimliğine en uygun." },
];

export default function LogoPreview() {
  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold">Shark — Logo Konseptleri</h1>
        <p className="text-stone-500">Renkler: navy #081120, fon #F4F7FA, altın #C9A86A, turkuaz #22D3EE</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {concepts.map((c) => (
          <div key={c.src} className="rounded-2xl border bg-white p-6 dark:bg-stone-900">
            <div className="flex justify-center rounded-xl bg-[#F4F7FA] p-6 dark:bg-black">
              <Image src={c.src} alt={c.title} width={220} height={220} />
            </div>
            <h2 className="mt-4 font-bold">{c.title}</h2>
            <p className="mt-1 text-sm text-stone-500">{c.desc}</p>
            <div className="mt-4 flex items-center gap-3">
              <Image src={c.src} alt="favicon test" width={32} height={32} className="rounded-md" />
              <Image src={c.src} alt="small test" width={16} height={16} />
              <span className="text-xs text-stone-400">16px / 32px favicon testi</span>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[#081120] p-6 text-white">
        <h2 className="font-bold">Koyu zeminde test</h2>
        <div className="mt-4 flex gap-6">
          {concepts.map((c) => (
            <Image key={c.src} src={c.src} alt={c.title} width={80} height={80} />
          ))}
        </div>
      </div>
    </div>
  );
}
