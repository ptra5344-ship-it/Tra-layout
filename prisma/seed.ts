import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

// PLACEHOLDER links: NOT real layouts. Replace each via the admin panel with a real copied layout link.
const PH = "https://link.clashofclans.com/en?action=OpenLayout&id=PLACEHOLDER-REPLACE-WITH-REAL-ID";
const bases = [
  { title: "TH7 War Base #1", type: "war", tags: ["war", "th7"] },
  { title: "TH7 War Base #2", type: "war", tags: ["war", "th7"] },
  { title: "TH7 Anti Dragon", type: "war", tags: ["anti-dragon", "th7"] },
  { title: "TH7 Anti Hog", type: "war", tags: ["anti-hog", "th7"] },
  { title: "TH7 CWL Base", type: "cwl", tags: ["cwl", "th7"] },
] as const;

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("Set ADMIN_PASSWORD in .env");
  await prisma.user.upsert({ where: { email }, update: {}, create: { email, passwordHash: await bcrypt.hash(pw, 12) } });
  if ((await prisma.base.count()) === 0) {
    for (const [i, b] of bases.entries()) {
      await prisma.base.create({ data: {
        title: b.title, townHall: 7, type: b.type, featured: i < 2,
        description: `${b.title} — PLACEHOLDER entry. Replace the layout link with a real official link.`,
        imageUrl: "/placeholder.svg", layoutLink: PH,
        tags: { connectOrCreate: b.tags.map((name) => ({ where: { name }, create: { name } })) },
      } });
    }
  }
  console.log("Seeded.");
}
main().finally(() => prisma.$disconnect());
