"use client";
import { use, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import type { BaseDTO } from "@/types";

export default function BasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const [b, setB] = useState<BaseDTO | null>(null); const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/bases/${id}`).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setB(d);
      fetch(`/api/bases/${id}/view`, { method: "POST" }).then((r) => r.json()).then((v) => v.views != null && setB((x) => x && { ...x, views: v.views })).catch(() => {});
    }).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <p className="p-10 text-center text-red-400">{err}</p>;
  if (!b) return <div className="h-96 animate-pulse rounded-xl bg-panel" />;

  const copy = async () => { try { await navigator.clipboard.writeText(b.layoutLink); toast("Layout link copied!"); } catch { toast("Copy failed", false); } };
  const like = async () => { const r = await fetch(`/api/bases/${id}/like`, { method: "POST" }); const d = await r.json(); if (r.ok) { setB({ ...b, likes: d.likes }); toast(d.liked ? "Liked ❤" : "Like removed"); } else toast(d.error, false); };
  const placeholder = b.layoutLink.includes("PLACEHOLDER");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={b.imageUrl} alt={b.title} className="w-full rounded-xl border border-slate-800" />
      <div className="space-y-4">
        <div className="flex gap-2"><span className="rounded-md bg-gold px-2 py-0.5 text-sm font-bold text-black">TH{b.townHall}</span><span className="rounded-md bg-slate-700 px-2 py-0.5 text-sm uppercase">{b.type}</span></div>
        <h1 className="text-3xl font-extrabold">{b.title}</h1>
        <p className="text-slate-300">{b.description || "No description."}</p>
        <div className="flex flex-wrap gap-2">{b.tags.map((t) => <span key={t} className="rounded-full bg-panel px-3 py-1 text-xs">#{t}</span>)}</div>
        <p className="text-sm text-slate-400">👁 {b.views} views · ❤ {b.likes} likes · {new Date(b.createdAt).toLocaleDateString()}</p>
        {placeholder && <p className="rounded-lg bg-amber-900/40 p-3 text-sm text-amber-300">⚠ Placeholder link — not a real layout yet.</p>}
        <div className="flex flex-wrap gap-2">
          <a href={b.layoutLink} target="_blank" rel="noopener noreferrer" className="btn-gold">Open in Clash of Clans</a>
          <button onClick={copy} className="btn-dark">Copy Layout</button>
          <button onClick={like} className="btn-dark">❤ Like</button>
        </div>
      </div>
    </div>
  );
}
