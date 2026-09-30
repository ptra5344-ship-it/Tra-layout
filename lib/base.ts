import type { Base, Tag } from "@prisma/client";
export const baseInclude = { tags: true } as const;
export function serialize(b: Base & { tags: Tag[] }) {
  return {
    id: b.id, title: b.title, townHall: b.townHall, type: b.type, description: b.description,
    imageUrl: b.imageUrl, layoutLink: b.layoutLink, tags: b.tags.map((t) => t.name),
    views: b.views, likes: b.likes, featured: b.featured, createdAt: b.createdAt,
  };
}
export const tagConnect = (tags: string[]) => tags.map((name) => ({ where: { name }, create: { name } }));
