import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";

const REVIEWS_PATH = path.join(process.cwd(), "data", "reviews.json");

async function readJsonSafe<T>(p: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(p, "utf-8")) as T; } catch { return fallback; }
}
async function writeJson(p: string, data: any) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

export async function PATCH(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Oturum yok." }, { status: 401 });
  if ((me.role || "user") !== "admin") return NextResponse.json({ error: "Yetki yok." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const action = String(body?.action || ""); // "hide" | "show" | "delete"
  if (!id || !action) return NextResponse.json({ error: "id ve action zorunlu." }, { status: 400 });

  const reviews = await readJsonSafe<any[]>(REVIEWS_PATH, []);
  const i = reviews.findIndex(r => String(r.id) === id);
  if (i === -1) return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });

  if (action === "hide") reviews[i].status = "hidden";
  else if (action === "show") reviews[i].status = "visible";
  else if (action === "delete") reviews[i].status = "deleted";
  else return NextResponse.json({ error: "Geçersiz action." }, { status: 400 });

  await writeJson(REVIEWS_PATH, reviews);
  return NextResponse.json({ ok: true, review: reviews[i] });
}
