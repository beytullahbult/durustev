import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

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
  if (!id) return NextResponse.json({ error: "id zorunlu." }, { status: 400 });

  const users = await readJsonSafe<any[]>(USERS_PATH, []);
  const i = users.findIndex(u => String(u.id) === id);
  if (i === -1) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });

  if (typeof body.role === "string") users[i].role = body.role === "admin" ? "admin" : "user";
  if (typeof body.isDisabled === "boolean") users[i].isDisabled = body.isDisabled;

  await writeJson(USERS_PATH, users);
  return NextResponse.json({ ok: true, user: users[i] });
}
