"use client";
import { useEffect, useState } from "react";
import { BaseCard } from "@/components/BaseCard";
import { useToast } from "@/components/Toast";
import type { BaseDTO } from "@/types";

const TYPES = ["war", "trophy", "farming", "hybrid", "cwl"];
const SORTS = [["latest", "Latest"], ["popular", "Popular"], ["likes", "Most liked"]];

function Grid({ items, loading }: { items: BaseDTO[]; loading: boolean }) {
  if (loading) return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-panel" />)}</div>;
  if (!items.length) return <p className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">No bases found. Try different filters.</p>;
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{items.map((b) => <BaseCard key={b.id} b={b} />)}</div>;
}

export default function Home() {
  const toast = useToast();
  const [q, setQ] = useState(""); const [th, setTh] = useState(0); const [type, setType] = useState(""); const [sort, setSort] = useState("latest");
  const [items, setItems] = useState<BaseDTO[]>([]); const [featured, setFeatured] = useState<BaseDTO[]>([]); const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bases?featured=true&limit=4").then((r) => r.json()).then((d) => setFeatured(d.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      const p = new URLSearchParams({ sort });
      if (q) p.set("q", q); if (th) p.set("townHall", String(th)); if (type) p.set("type", type);
      try {
        const r = await fetch(`/api/bases?${p}`); const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setItems(d.data);
      } catch (e) { toast((e as Error).message || "Failed to load bases", false); }
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q, th, type, sort, toast]);

  const chip = (on: boolean) => `shrink-0 rounded-full px-3 py-1 text-sm ${on ? "bg-gold font-bold text-black" : "bg-panel hover:bg-slate-700"}`;
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-panel p-6 text-center">
        <h1 className="text-3xl font-extrabold">Find your perfect <span className="text-gold">base layout</span></h1>
        <input className="input mx-auto mt-4 max-w-md" placeholder="Search bases (e.g. dragon)…" value={q} onChange={(e) => setQ(e.target.value)} />
      </section>
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button className={chip(th === 0)} onClick={() => setTh(0)}>All TH</button>
          {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => <button key={n} className={chip(th === n)} onClick={() => setTh(n)}>TH{n}</button>)}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button className={chip(!type)} onClick={() => setType("")}>All types</button>
          {TYPES.map((t) => <button key={t} className={chip(type === t)} onClick={() => setType(t)}>{t.toUpperCase()}</button>)}
        </div>
      </div>
      {featured.length > 0 && !q && !th && !type && (<section><h2 className="mb-3 text-xl font-bold">⭐ Featured</h2><Grid items={featured} loading={false} /></section>)}
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">Bases</h2>
          <div className="flex gap-2">{SORTS.map(([k, l]) => <button key={k} className={chip(sort === k)} onClick={() => setSort(k)}>{l}</button>)}</div>
        </div>
        <Grid items={items} loading={loading} />
      </section>
    </div>
  );
}
