import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientId, rateLimit } from "@/lib/rate-limit";

// Toggles the like for this visitor (anonymous, fingerprint = hashed IP + UA)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, "like", 20); if (limited) return limited;
  const { id } = await params, fingerprint = clientId(req);
  if (!(await prisma.base.findUnique({ where: { id }, select: { id: true } }))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const existing = await prisma.like.findUnique({ where: { baseId_fingerprint: { baseId: id, fingerprint } } });
  const [, base] = existing
    ? await prisma.$transaction([prisma.like.delete({ where: { id: existing.id } }), prisma.base.update({ where: { id }, data: { likes: { decrement: 1 } } })])
    : await prisma.$transaction([prisma.like.create({ data: { baseId: id, fingerprint } }), prisma.base.update({ where: { id }, data: { likes: { increment: 1 } } })]);
  return NextResponse.json({ liked: !existing, likes: base.likes });
}
