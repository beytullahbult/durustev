// src/lib/jwt.ts
import crypto from "node:crypto";

const DEFAULT_EXP_SECONDS = 60 * 60 * 24 * 30; // 30 gün
const ALG = "HS256";
const SECRET = (process.env.JWT_SECRET || "").trim() || "dev-only-secret-change-me";

type JWTPayload = {
  sub: string;            // user id
  email: string;
  name?: string;
  isAdmin?: boolean;
  iat: number;
  exp: number;
};

function b64url(input: Buffer | string) {
  return Buffer
    .from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(data: string) {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(data);
  return b64url(hmac.digest());
}

export function signJWT(payload: Omit<JWTPayload, "iat" | "exp">, expSeconds = DEFAULT_EXP_SECONDS) {
  const header = { alg: ALG, typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expSeconds;

  const pld: JWTPayload = { ...payload, iat, exp };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(pld));
  const s = sign(`${h}.${p}`);
  return `${h}.${p}.${s}`;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    const expected = sign(`${h}.${p}`);
    if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(p, "base64").toString("utf8")) as JWTPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

// App Router uyumlu: cookie içinden JWT okuyup doğrular
export async function verifySession(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(/;\s*/).map((c) => {
      const i = c.indexOf("=");
      return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
    })
  );
  const token = cookies["du_session"];
  if (!token) return null;
  return verifyJWT(token);
}
