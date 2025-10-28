// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { loginAndIssueToken } from "../../../../lib/auth";
export const runtime = "nodejs";

/**
 * Body: { email: string, password: string }
 * Success: 200 { user, notices } + HttpOnly "dsession" cookie
 * Fail: 400/401 JSON { error }
 */
export async function POST(req: Request) {
  try {
    // Body güvenli parse
    let email = "";
    let password = "";
    try {
      const body = await req.json();
      email = String(body?.email ?? "").trim();
      password = String(body?.password ?? "");
    } catch {
      return NextResponse.json(
        { error: "Geçersiz istek gövdesi." },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre zorunludur." },
        { status: 400 }
      );
    }

    // Giriş kontrolü + JWT üretimi (cookie’yi route’ta set edeceğiz)
    const result = await loginAndIssueToken(email, password);
    if (!result.ok) {
      // "Hesap şifre verisi eksik." dahil tüm hataları aynen döndürür
      const code = result.error === "Hesabınız devre dışıdır. Lütfen destek ile iletişime geçin."
        ? 403
        : (result.error === "E-posta veya şifre hatalı." ? 401 : 400);
      return NextResponse.json({ error: result.error }, { status: code });
    }

    // Başarılı: HttpOnly cookie set et
    const res = NextResponse.json(
      { user: result.user, notices: result.notices ?? [] },
      { status: 200 }
    );

    res.cookies.set({
      name: "dsession",
      value: result.token,          // JWT
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: result.maxAge,        // saniye
    });

    return res;
  } catch (err) {
    console.error("LOGIN POST ERROR:", err);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}

/** (Opsiyonel) Preflight/CORS için */
export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
