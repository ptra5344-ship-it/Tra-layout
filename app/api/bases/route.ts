import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { baseSchema } from "@/lib/validators";
import { baseInclude, serialize, tagConnect } from "@/lib/base";
import { queryBases } from "@/lib/query";

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "list"); if (limited) return limited;
  try { return NextResponse.json(await queryBases(req.nextUrl.searchParams)); }
  catch (e) { console.error(e); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(); if (denied) return denied;
  const parsed = baseSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  const { tags, ...rest } = parsed.data;
  const base = await prisma.base.create({ data: { ...rest, tags: { connectOrCreate: tagConnect(tags) } }, include: baseInclude });
  return NextResponse.json(serialize(base), { status: 201 });
}
