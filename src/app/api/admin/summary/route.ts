import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");
const REVIEWS_PATH = path.join(process.cwd(), "data", "reviews.json");

async function readJsonSafe<T>(p: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(p, "utf-8")) as T; } catch { return fallback; }
}

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Oturum yok." }, { status: 401 });
  if ((me.role || "user") !== "admin") return NextResponse.json({ error: "Yetki yok." }, { status: 403 });

  const users = await readJsonSafe<any[]>(USERS_PATH, []);
  const reviews = await readJsonSafe<any[]>(REVIEWS_PATH, []);

  // Kullanıcıları hızlı erişim için indeksle
  const usersById = new Map<string, any>();
  for (const u of users) usersById.set(String(u.id), u);

  // Yorumları zenginleştir (fallback alan adlarıyla)
  const reviewsWithDisplay = reviews.map((r: any) => {
    const userId = r.userId || r.userID || r.authorId || r.createdBy || r.user_id;
    const user = userId ? usersById.get(String(userId)) : null;

    const displayUser =
      (user && (user.name || user.email)) ||
      r.userEmail ||
      r.email ||
      r.user ||
      r.author ||
      null;

    const displayText =
      r.text ??
      r.comment ??
      r.content ??
      r.body ??
      r.description ??
      r.review ??
      "";

    return {
      ...r,
      displayUser: displayUser || "-",       // UI'da hazır gösterilecek
      displayText: String(displayText || "").trim() || "-", // boşsa '-'
    };
  });

  return NextResponse.json({
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role || "user",
      isDisabled: !!u.isDisabled,
      isVerified: !!u.isVerified,
      createdAt: u.createdAt,
    })),
    reviews: reviewsWithDisplay,
  });
}
