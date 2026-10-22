// Step figures built from real teaching photos/diagrams (Wikimedia Commons,
// freely licensed — see public/knots/ATTRIBUTION.md and per-photo credit).
// Local files keep the PWA offline-capable.
import Image from "next/image";
import { KNOT_PHOTOS } from "@/lib/knot-photos";

export function KnotStepFigures({ id, steps }: { id: string; steps: string[] }) {
  const photos = KNOT_PHOTOS[id] ?? [];
  if (!photos.length) return null;
  return (
    <div className="mt-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {photos.map((p, i) => {
          const caption = p.caption ?? steps[i] ?? steps[steps.length - 1] ?? "";
          const alt = caption ? `${id} knot step ${i + 1}: ${caption}` : `${id} knot step ${i + 1}`;
          return (
            <figure key={p.src} className="rounded-xl bg-white p-1.5 ring-1 ring-amber-200 print:ring-black">
              <Image src={p.src} alt={alt} width={p.width} height={p.height} sizes="(max-width: 640px) 100vw, 50vw" loading="lazy" className="h-auto w-full rounded-lg" unoptimized={p.src.endsWith(".gif")} />
              <figcaption className="mt-1 flex gap-1.5 px-1 pb-1 text-xs leading-snug">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">{i + 1}</span>
                <span>{p.caption ?? steps[i] ?? steps[steps.length - 1]}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">
        Photos: {photos.map((p, i) => (
          <span key={p.src}>{i > 0 ? " · " : ""}<a className="underline" href={p.page} target="_blank" rel="noreferrer">{p.credit}</a></span>
        ))}
      </p>
    </div>
  );
}
