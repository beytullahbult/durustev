// src/app/api/reviews/[id]/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const REVIEWS_PATH = path.join(process.cwd(), "data", "reviews.json");

async function readAll(): Promise<any[]> {
  try {
    const txt = await fs.readFile(REVIEWS_PATH, "utf-8");
    return JSON.parse(txt) as any[];
  } catch {
    return [];
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  // ✅ Yeni kural: params'ı await et
  const { id } = await ctx.params;

  const all = await readAll();
  const item = all.find((r) => String(r?.id) === String(id));
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ review: item });
}
