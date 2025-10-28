// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";
const ALG = "HS256";
const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ me: null }, { status: 200 });

    const { payload } = await jwtVerify(token, SECRET, { algorithms: [ALG] });

    const me = {
      id: String(payload.sub || payload.uid || ""),
      email: String(payload.email || ""),
      name: (payload.name as string) || undefined,
      isAdmin: !!payload.role && String(payload.role).toLowerCase() === "admin",
      isVerified: payload.isVerified === undefined ? true : !!payload.isVerified,
    };

    return NextResponse.json({ me }, { status: 200 });
  } catch {
    return NextResponse.json({ me: null }, { status: 200 });
  }
}
