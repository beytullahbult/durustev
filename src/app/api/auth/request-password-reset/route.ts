import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");
const TOKENS_PATH = path.join(process.cwd(), "data", "reset_tokens.json");
const APP_URL = process.env.APP_URL || "http://localhost:3000"; // prod'da domainini koy

async function readJsonSafe<T>(p: string, fallback: T): Promise<T> {
  try {
    const txt = await fs.readFile(p, "utf-8");
    return JSON.parse(txt) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(p: string, data: any) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "E-posta zorunludur." }, { status: 400 });
    }

    // Kullanıcı var mı kontrolü (yoksa da 200 döneriz; bilgi sızdırmayız)
    const users = await readJsonSafe<any[]>(USERS_PATH, []);
    const user = users.find((u) => String(u.email || "").toLowerCase() === email);

    // Token üret
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 saat

    // Token'ı dosyaya ekle
    const tokens = await readJsonSafe<any[]>(TOKENS_PATH, []);
    tokens.push({ token, email, expiresAt, used: false });
    await writeJson(TOKENS_PATH, tokens);

    // Kullanıcı varsa mail atılacak, dev modda link döndürüyoruz
    const resetUrl = `${APP_URL}/sifre-sifirla/${token}`;

    // Not: Production'da burada SMTP ile email gönderin.
    // await sendEmail(email, "Şifre Sıfırlama", `Link: ${resetUrl}`)

    return NextResponse.json({
      ok: true,
      resetUrl, // dev kolaylık
      message:
        user
          ? "Sıfırlama bağlantısı e-posta adresinize gönderildi."
          : "Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
