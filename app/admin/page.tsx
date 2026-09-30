"use client";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import type { BaseDTO } from "@/types";

const empty = { title: "", townHall: 7, type: "war", description: "", imageUrl: "", layoutLink: "", tags: "" };
type Stats = { bases: number; featured: number; views: number; likes: number };

export default function Admin() {
  const toast = useToast();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [cred, setCred] = useState({ email: "", password: "" });
  const [bases, setBases] = useState<BaseDTO[]>([]); const [stats, setStats] = useState<Stats | null>(null);
  const [form, setForm] = useState(empty); const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [b, s] = await Promise.all([fetch("/api/bases?limit=60").then((r) => r.json()), fetch("/api/stats").then((r) => r.json())]);
    setBases(b.data ?? []); setStats(s.bases != null ? s : null);
  }, []);
  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => { setAuthed(d.admin); if (d.admin) load(); }); }, [load]);

  const login = async () => {
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cred) });
    if (r.ok) { setAuthed(true); load(); } else toast((await r.json()).error, false);
  };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setAuthed(false); };

  const upload = async (f?: File) => {
    if (!f) return; const fd = new FormData(); fd.append("file", f);
    const r = await fetch("/api/upload", { method: "POST", body: fd }); const d = await r.json();
    if (r.ok) { setForm((x) => ({ ...x, imageUrl: d.url })); toast("Image uploaded"); } else toast(d.error, false);
  };

  const save = async () => {
    const body = { ...form, townHall: Number(form.townHall), tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    const r = await fetch(editing ? `/api/bases/${editing}` : "/api/bases", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { const m = d.issues ? Object.values(d.issues.fieldErrors).flat().join("; ") : d.error; return toast(m || "Error", false); }
    toast(editing ? "Base updated" : "Base created"); setForm(empty); setEditing(null); load();
  };
  const edit = (b: BaseDTO) => { setEditing(b.id); setForm({ title: b.title, townHall: b.townHall, type: b.type, description: b.description, imageUrl: b.imageUrl, layoutLink: b.layoutLink, tags: b.tags.join(", ") }); window.scrollTo(0, 0); };
  const del = async (id: string) => { if (!confirm("Delete this base?")) return; const r = await fetch(`/api/bases/${id}`, { method: "DELETE" }); if (r.ok) { toast("Deleted"); load(); } else toast("Failed", false); };
  const feature = async (b: BaseDTO) => { await fetch(`/api/bases/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured: !b.featured }) }); load(); };

  if (authed === null) return <p className="p-10 text-center">Loading…</p>;
  if (!authed) return (
    <div className="mx-auto max-w-sm space-y-3 rounded-xl bg-panel p-6">
      <h1 className="text-xl font-bold">Admin login</h1>
      <input className="input" placeholder="Email" value={cred.email} onChange={(e) => setCred({ ...cred, email: e.target.value })} />
      <input className="input" type="password" placeholder="Password" value={cred.password} onChange={(e) => setCred({ ...cred, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && login()} />
      <button className="btn-gold w-full" onClick={login}>Sign in</button>
    </div>
  );

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Admin dashboard</h1><button className="btn-dark" onClick={logout}>Log out</button></div>
      {stats && <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Object.entries(stats).map(([k, v]) => <div key={k} className="rounded-xl bg-panel p-4"><p className="text-xs uppercase text-slate-400">{k}</p><p className="text-2xl font-bold text-gold">{v}</p></div>)}</div>}
      <section className="grid gap-3 rounded-xl bg-panel p-4 md:grid-cols-2">
        <h2 className="font-bold md:col-span-2">{editing ? "Edit base" : "Add base"}</h2>
        <input className="input" placeholder="Title" value={form.title} onChange={set("title")} />
        <div className="flex gap-2">
          <select className="input" value={form.townHall} onChange={set("townHall")}>{Array.from({ length: 18 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>TH{n}</option>)}</select>
          <select className="input" value={form.type} onChange={set("type")}>{["war", "trophy", "farming", "hybrid", "cwl"].map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <input className="input md:col-span-2" placeholder="Layout link: https://link.clashofclans.com/en?action=OpenLayout&id=..." value={form.layoutLink} onChange={set("layoutLink")} />
        <div className="flex gap-2"><input className="input" placeholder="Image URL or upload →" value={form.imageUrl} onChange={set("imageUrl")} /><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => upload(e.target.files?.[0])} className="w-28 text-xs" /></div>
        <input className="input" placeholder="Tags (comma separated)" value={form.tags} onChange={set("tags")} />
        <textarea className="input md:col-span-2" rows={3} placeholder="Description" value={form.description} onChange={set("description")} />
        <div className="flex gap-2"><button className="btn-gold" onClick={save}>{editing ? "Update" : "Create"}</button>{editing && <button className="btn-dark" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}</div>
      </section>
      <section className="space-y-2">
        {bases.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-2 rounded-lg bg-panel p-3">
            <div className="min-w-0"><p className="truncate font-semibold">{b.title} {b.featured && "⭐"}</p><p className="text-xs text-slate-400">TH{b.townHall} · {b.type} · 👁 {b.views} · ❤ {b.likes}{b.layoutLink.includes("PLACEHOLDER") && " · ⚠ placeholder link"}</p></div>
            <div className="flex shrink-0 gap-1"><button className="btn-dark" onClick={() => feature(b)}>{b.featured ? "Unfeature" : "Feature"}</button><button className="btn-dark" onClick={() => edit(b)}>Edit</button><button className="btn bg-red-700" onClick={() => del(b.id)}>Delete</button></div>
          </div>
        ))}
      </section>
    </div>
  );
}
