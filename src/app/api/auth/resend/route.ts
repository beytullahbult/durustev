// src/app/api/auth/resend/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { genVerifyToken, hashToken, readUsers, tokenExpiryHours, writeUsers } from "@/lib/verify-utils";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const users = await readUsers();
  const idx = users.findIndex(u => (u.email || "").toLowerCase() === email);
  if (idx === -1) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });

  const u = users[idx];
  if (u.isVerified) return NextResponse.json({ ok: true, message: "Zaten doğrulanmış." });

  const last = u.verifyTokenSentAt ? new Date(u.verifyTokenSentAt).getTime() : 0;
  if (Date.now() - last < 60 * 1000) {
    return NextResponse.json({ error: "Lütfen biraz sonra tekrar deneyin." }, { status: 429 });
  }

  const token = genVerifyToken();
  u.verifyTokenHash = hashToken(token);
  u.verifyTokenExpiresAt = tokenExpiryHours(24);
  u.verifyTokenSentAt = new Date().toISOString();
  users[idx] = u;
  await writeUsers(users);

  try {
    await sendVerificationEmail(u.email!, u.name ?? undefined, token, siteUrl);
  } catch (e: any) {
    const details = typeof e?.message === "string" ? e.message : String(e);
    return NextResponse.json({ error: "Gönderim başarısız.", details }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Doğrulama e-postası gönderildi." });
}
