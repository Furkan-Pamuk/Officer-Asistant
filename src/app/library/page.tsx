import { LIBRARY_BOOKS } from "@/lib/data";

export default function Library() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Library — sources & study material</h1>
      <p className="text-sm text-slate-600">Add the books behind each inspection. SIRE/CDI official texts are licensed — we link them and provide summary preparation cards.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {LIBRARY_BOOKS.map((b) => (
          <div key={b.id} className="rounded-2xl border bg-white p-4">
            <div className="text-xs font-bold text-sky-700">{b.abbr}</div>
            <h2 className="font-semibold">{b.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{b.description}</p>
            <p className="mt-1 text-xs text-slate-500">Used for: {b.inspections.join(", ")}</p>
            <a href={b.link} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">Open official source</a>
          </div>
        ))}
      </div>
    </div>
  );
}
