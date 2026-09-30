import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { baseInclude, serialize } from "./base";
import { BASE_TYPES } from "./validators";

export async function queryBases(sp: URLSearchParams) {
  const where: Prisma.BaseWhereInput = {};
  const th = Number(sp.get("townHall"));
  if (th >= 1 && th <= 18) where.townHall = th;
  const type = sp.get("type");
  if (type && (BASE_TYPES as readonly string[]).includes(type)) where.type = type as (typeof BASE_TYPES)[number];
  if (sp.get("featured") === "true") where.featured = true;
  const q = (sp.get("q") ?? "").trim().slice(0, 60);
  if (q) where.OR = [
    { title: { contains: q, mode: "insensitive" } },
    { description: { contains: q, mode: "insensitive" } },
    { tags: { some: { name: { contains: q.toLowerCase() } } } },
  ];
  const sort = sp.get("sort");
  const orderBy: Prisma.BaseOrderByWithRelationInput = sort === "popular" ? { views: "desc" } : sort === "likes" ? { likes: "desc" } : { createdAt: "desc" };
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 24, 1), 60);
  const page = Math.max(Number(sp.get("page")) || 1, 1);
  const [items, total] = await Promise.all([
    prisma.base.findMany({ where, orderBy, take: limit, skip: (page - 1) * limit, include: baseInclude }),
    prisma.base.count({ where }),
  ]);
  return { data: items.map(serialize), total, page, limit };
}
