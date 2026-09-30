import { z } from "zod";

// Only official CoC layout deep links: https://link.clashofclans.com/<lang>?action=OpenLayout&id=...
const LAYOUT_RE = /^https:\/\/link\.clashofclans\.com\/[a-z]{2}(?:-[A-Za-z]{2})?\?action=OpenLayout&id=[A-Za-z0-9%_\-:.=]+$/;

const imageUrl = z.string().max(500).refine((u) => {
  if (u.startsWith("/") && !u.startsWith("//")) return true;
  try {
    const url = new URL(u);
    const allowed = (process.env.IMAGE_HOSTS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    return url.protocol === "https:" && (url.hostname.endsWith(".public.blob.vercel-storage.com") || allowed.includes(url.hostname));
  } catch { return false; }
}, "Image must be a local path, Vercel Blob URL, or an allowed host (IMAGE_HOSTS)");

export const BASE_TYPES = ["war", "trophy", "farming", "hybrid", "cwl"] as const;

export const baseSchema = z.object({
  title: z.string().trim().min(3).max(100),
  townHall: z.coerce.number().int().min(1).max(18),
  type: z.enum(BASE_TYPES),
  description: z.string().trim().max(2000).default(""),
  imageUrl,
  layoutLink: z.string().trim().max(500).regex(LAYOUT_RE, "Must be an official Clash of Clans layout link (link.clashofclans.com ... action=OpenLayout&id=...)"),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(10).default([]),
  featured: z.boolean().optional(),
});
export const baseUpdateSchema = baseSchema.partial();
