import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin(); if (denied) return denied;
  const [bases, agg, featured, byTh] = await Promise.all([
    prisma.base.count(), prisma.base.aggregate({ _sum: { views: true, likes: true } }),
    prisma.base.count({ where: { featured: true } }), prisma.base.groupBy({ by: ["townHall"], _count: true, orderBy: { townHall: "asc" } }),
  ]);
  return NextResponse.json({ bases, featured, views: agg._sum.views ?? 0, likes: agg._sum.likes ?? 0, byTownHall: byTh.map((r) => ({ townHall: r.townHall, count: r._count })) });
}
