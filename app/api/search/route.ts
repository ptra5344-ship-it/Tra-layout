import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { queryBases } from "@/lib/query";

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "search"); if (limited) return limited;
  return NextResponse.json(await queryBases(req.nextUrl.searchParams));
}
