import Link from "next/link";
import type { BaseDTO } from "@/types";
export function BaseCard({ b }: { b: BaseDTO }) {
  return (
    <Link href={`/bases/${b.id}`} className="group overflow-hidden rounded-xl border border-slate-800 bg-panel transition hover:border-gold">
      <div className="relative aspect-[16/10] bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.imageUrl} alt={b.title} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-md bg-gold px-2 py-0.5 text-xs font-bold text-black">TH{b.townHall}</span>
        <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-xs uppercase">{b.type}</span>
      </div>
      <div className="p-3">
        <h3 className="truncate font-semibold group-hover:text-gold">{b.title}</h3>
        <p className="mt-1 text-xs text-slate-400">👁 {b.views} · ❤ {b.likes}</p>
      </div>
    </Link>
  );
}
