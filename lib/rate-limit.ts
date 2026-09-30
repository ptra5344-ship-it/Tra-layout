import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

// In-memory limiter: fine for one instance / dev. On Vercel (serverless) swap for Upstash Ratelimit.
const hits = new Map<string, { n: number; reset: number }>();

export function clientId(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  return createHash("sha256").update(ip + (req.headers.get("user-agent") ?? "")).digest("hex").slice(0, 32);
}
export function rateLimit(req: NextRequest, key: string, limit = 60, windowMs = 60_000) {
  const k = `${key}:${clientId(req)}`, now = Date.now();
  const e = hits.get(k);
  if (!e || e.reset < now) { hits.set(k, { n: 1, reset: now + windowMs }); return null; }
  if (++e.n > limit) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((e.reset - now) / 1000)) } });
  return null;
}
