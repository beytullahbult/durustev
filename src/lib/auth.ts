// src/app/lib/auth.ts
import { headers } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";

const COOKIE_NAME = "session";
const ALG = "HS256";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);

export type SessionUser = {
  sub: string;
  email: string;
  role: "admin" | "user";
  name?: string;
  iat?: number;
  exp?: number;
  isVerified?: boolean;
};

function toSessionUser(payload: JWTPayload): SessionUser | null {
  const sub = String(payload.sub || "");
  const email = String((payload as any).email || "");
  const role = String((payload as any).role || "user").toLowerCase();

  if (!sub || !email) return null;
  if (role !== "admin" && role !== "user") return null;

  return {
    sub,
    email,
    role: role as "admin" | "user",
    name: (payload as any).name as string | undefined,
    iat: payload.iat,
    exp: payload.exp,
    isVerified:
      (payload as any).isVerified === undefined
        ? true
        : Boolean((payload as any).isVerified),
  };
}

/** Cookie header’ından tek bir cookie değerini okur (Next 14/15 uyumlu) */
async function getCookieValue(name: string): Promise<string | null> {
  // headers() bazı sürümlerde Promise döner. await etmek her iki durumda da güvenlidir.
  const h = (await (headers() as any)) as { get: (key: string) => string | null | undefined };

  const cookieHeader = h?.get("cookie") || "";
  if (!cookieHeader) return null;

  // "a=1; b=2; c=3" formatını ayrıştır
  const parts: string[] = cookieHeader.split(";");

  for (const part of parts) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);

    if (key === name) {
      try {
        return decodeURIComponent(value);
      } catch {
        return value; // decode hatasında ham değeri döndür
      }
    }
  }
  return null;
}

/**
 * Server component / route handler içinde oturum bilgisi alır.
 * Token yok veya geçersizse null döner.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const token = await getCookieValue(COOKIE_NAME);
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET, { algorithms: [ALG] });
    return toSessionUser(payload);
  } catch {
    return null;
  }
}

/** Oturum zorunlu alanlar için yardımcı */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

/** Admin korumalı alanlar için yardımcı */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}
