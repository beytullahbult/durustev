// src/lib/get-session.ts
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export type Session = {
  uid: string;
  email: string;
  name?: string | null;
  isAdmin?: boolean;
  isVerified?: boolean;
};

function looksLikeJWT(value: string) {
  return typeof value === "string" && value.split(".").length === 3;
}

async function extractToken(): Promise<string | null> {
  const jar = await cookies();

  // En yaygın anahtar isimleri + Bearer desteği
  const commonKeys = [
    "token",
    "Authorization",
    "authorization",
    "session",
    "auth",
    "jwt",
    "durustev_token",
    "durustev_session",
  ];

  for (const key of commonKeys) {
    const v = jar.get(key)?.value;
    if (!v) continue;
    if (v.startsWith("Bearer ")) return v.slice(7);
    if (looksLikeJWT(v)) return v;
  }

  // Son çare: tüm çerezleri tara
  for (const c of jar.getAll()) {
    const val = c.value?.startsWith("Bearer ") ? c.value.slice(7) : c.value;
    if (looksLikeJWT(val)) return val;
  }

  return null;
}

export async function getSession(): Promise<Session | null> {
  try {
    const token = await extractToken();
    if (!token) return null;

    const payload: any = await verifyJWT(token);
    if (!payload || !payload.uid || !payload.email) return null;

    return {
      uid: String(payload.uid),
      email: String(payload.email),
      name: payload.name ?? null,
      isAdmin: Boolean(payload.isAdmin),
      isVerified:
        payload.isVerified === undefined ? true : Boolean(payload.isVerified),
    };
  } catch {
    return null;
  }
}
