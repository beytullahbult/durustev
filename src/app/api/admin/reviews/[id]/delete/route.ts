// src/app/api/admin/reviews/[id]/delete/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = params.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const dataDir = path.join(process.cwd(), "data");
    const reviewsPath = path.join(dataDir, "reviews.json");

    const raw = await fs.readFile(reviewsPath, "utf8").catch(() => "[]");
    let list: any[] = [];
    try { list = JSON.parse(raw); } catch { list = []; }

    const idx = list.findIndex((r) => r?.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // soft delete
    list[idx].deleted = true;
    list[idx].updatedAt = new Date().toISOString();

    await fs.writeFile(reviewsPath, JSON.stringify(list, null, 2), "utf8");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("POST /api/admin/reviews/[id]/delete error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
