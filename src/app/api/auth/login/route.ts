// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SignJWT } from "jose";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_PATH = path.join(DATA_DIR, "users.json");

const COOKIE_NAME = "session";
const ALG = "HS256";
const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

type User = {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "user";
  isDisabled?: boolean;
  isVerified?: boolean;
  password?: string;           // düz parola için
  passwordHash?: string;       // scrypt
  passwordSalt?: string;       // base64
  passwordAlgo?: "scrypt";
  passwordIter?: number;
};

function verifyPassword(plain: string, u: User): boolean {
  // Düz parola (örnek kayıtlar)
  if (u.password) return plain === u.password;

  // scrypt şeması
  if (u.passwordHash && u.passwordSalt && u.passwordAlgo?.toLowerCase() === "scrypt") {
    const keyLen = 64;
    const salt = Buffer.from(u.passwordSalt, "base64");
    const stored = Buffer.from(u.passwordHash, "base64");
    const iter = Number(u.passwordIter) || 1;

    let out = crypto.scryptSync(plain, salt, keyLen);
    for (let i = 1; i < iter; i++) {
      out = crypto.scryptSync(out, salt, keyLen);
    }
    return crypto.timingSafeEqual(out, stored);
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
    }

    const raw = await fs.readFile(USERS_PATH, "utf-8");
    const users: User[] = JSON.parse(raw);

    const user = users.find(
      (u) => u.email.toLowerCase() === String(email).trim().toLowerCase()
    );
    if (!user) return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    if (user.isDisabled) return NextResponse.json({ error: "Hesap pasif." }, { status: 403 });

    const ok = verifyPassword(password, user);
    if (!ok) return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });

    // JWT oluştur
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified !== false,
    })
      .setProtectedHeader({ alg: ALG })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET);

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
