import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { baseUpdateSchema } from "@/lib/validators";
import { baseInclude, serialize, tagConnect } from "@/lib/base";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const limited = rateLimit(req, "get"); if (limited) return limited;
  const base = await prisma.base.findUnique({ where: { id: (await params).id }, include: baseInclude });
  return base ? NextResponse.json(serialize(base)) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(); if (denied) return denied;
  const parsed = baseUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  const { tags, ...rest } = parsed.data;
  try {
    const base = await prisma.base.update({
      where: { id: (await params).id },
      data: { ...rest, ...(tags ? { tags: { set: [], connectOrCreate: tagConnect(tags) } } : {}) },
      include: baseInclude,
    });
    return NextResponse.json(serialize(base));
  } catch { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(); if (denied) return denied;
  try { await prisma.base.delete({ where: { id: (await params).id } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
}
