import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientId, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(req, "view", 30); if (limited) return limited;
  const { id } = await params, fingerprint = clientId(req);
  if (!(await prisma.base.findUnique({ where: { id }, select: { id: true } }))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Count one view per visitor per hour
  const recent = await prisma.view.findFirst({ where: { baseId: id, fingerprint, createdAt: { gt: new Date(Date.now() - 3600_000) } } });
  if (!recent) await prisma.$transaction([prisma.view.create({ data: { baseId: id, fingerprint } }), prisma.base.update({ where: { id }, data: { views: { increment: 1 } } })]);
  const b = await prisma.base.findUnique({ where: { id }, select: { views: true } });
  return NextResponse.json({ views: b?.views ?? 0 });
}
