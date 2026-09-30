import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET must be set (16+ chars)");
  return new TextEncoder().encode(s);
};
export const COOKIE = "admin_token";

export async function signToken(userId: string) {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setSubject(userId)
    .setExpirationTime("7d").sign(secret());
}
export async function getAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret()); return payload.role === "admin" ? payload : null; }
  catch { return null; }
}
/** Returns an error response if not admin, else null. */
export async function requireAdmin() {
  return (await getAdmin()) ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
