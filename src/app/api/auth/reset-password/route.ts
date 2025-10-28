import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
// Basitlik için şifreyi düz yazı olarak saklıyoruz (projenizde mevcut durum nasılsa onu koruyun).
// İsterseniz Node crypto ile hash'e de güncelleyebilirim.

const USERS_PATH = path.join(process.cwd(), "data", "users.json");
const TOKENS_PATH = path.join(process.cwd(), "data", "reset_tokens.json");

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
    const token = String(body?.token || "");
    const newPassword = String(body?.newPassword || "");

    if (!token || newPassword.length < 6) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const tokens = await readJsonSafe<any[]>(TOKENS_PATH, []);
    const t = tokens.find((x) => x.token === token);

    if (!t) {
      return NextResponse.json({ error: "Token geçersiz." }, { status: 400 });
    }
    if (t.used) {
      return NextResponse.json({ error: "Token zaten kullanılmış." }, { status: 400 });
    }
    if (Date.now() > Number(t.expiresAt)) {
      return NextResponse.json({ error: "Token süresi dolmuş." }, { status: 400 });
    }

    // Kullanıcıyı bul ve şifreyi güncelle
    const users = await readJsonSafe<any[]>(USERS_PATH, []);
    const idx = users.findIndex((u) => String(u.email || "").toLowerCase() === String(t.email || "").toLowerCase());
    if (idx === -1) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 400 });
    }

    users[idx].password = newPassword; // mevcut yapınıza uygun şekilde güncelledim
    await writeJson(USERS_PATH, users);

    // Token'ı kullanılmış işaretle
    t.used = true;
    await writeJson(TOKENS_PATH, tokens);

    return NextResponse.json({ ok: true, message: "Şifre güncellendi." });
  } catch (e: any) {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
