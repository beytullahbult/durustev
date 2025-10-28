import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

type User = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  isDisabled: boolean;
  isVerified: boolean;
  createdAt: string;
  // Şifre alanları (uyumluluk için hem plain hem hash alanlarını tutuyoruz)
  password?: string;               // mevcut bazı kayıtlarla uyum için (opsiyonel)
  passwordHash?: string;           // scrypt çıktısı (base64)
  passwordSalt?: string;           // scrypt tuzu (base64)
  passwordAlgo?: "scrypt";
  passwordIter?: number;           // iterasyon sayısı (uyumluluk için 1)
  // Ek alanlar
  isAnonymous?: boolean;
};

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

function makeId() {
  return crypto.randomUUID?.() ?? (Math.random().toString(36).slice(2) + Date.now().toString(36));
}

function hashPasswordScrypt(password: string) {
  const salt = crypto.randomBytes(16); // 128-bit salt
  // Node scrypt varsayılanı N=16384, r=8, p=1 — users.json’daki örnekle uyumlu
  const key = crypto.scryptSync(password, salt, 64);
  return {
    passwordHash: key.toString("base64"),
    passwordSalt: salt.toString("base64"),
    passwordAlgo: "scrypt" as const,
    passwordIter: 1,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const nicknameRaw = (body?.nickname ?? body?.name ?? "").toString().trim();
    const isAnonymous = body?.isAnonymous === true;

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve parola zorunludur." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Parola en az 6 karakter olmalıdır." }, { status: 400 });
    }

    const users = await readJsonSafe<User[]>(USERS_PATH, []);

    // E-posta benzersizliği (case-insensitive)
    const exists = users.some(u => (u.email || "").toLowerCase() === email);
    if (exists) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    }

    const { passwordHash, passwordSalt, passwordAlgo, passwordIter } = hashPasswordScrypt(password);

    const user: User = {
      id: makeId(),
      email,
      name: nicknameRaw || "Anonim Kullanıcı",
      role: "user",
      isDisabled: false,
      isVerified: true,      // mevcut users.json’da hesaplar doğrulanmış görünüyor
      createdAt: new Date().toISOString(),
      // UYUMLULUK: hem hash'li hem plain alanı yazıyoruz (login mantığın düz/karma olabilir)
      password,              // ← istersen bu satırı güvenlik için kaldırabiliriz
      passwordHash,
      passwordSalt,
      passwordAlgo,
      passwordIter,
      isAnonymous,
    };

    users.push(user);
    await writeJson(USERS_PATH, users);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAnonymous: user.isAnonymous,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
