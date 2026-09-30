import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(); if (denied) return denied;
  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || !TYPES[file.type] || file.size > 4_000_000)
    return NextResponse.json({ error: "PNG/JPG/WEBP up to 4MB only" }, { status: 400 });
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${TYPES[file.type]}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`bases/${name}`, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  }
  // Local dev fallback (Vercel's filesystem is read-only — configure Blob or Cloudinary there)
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
