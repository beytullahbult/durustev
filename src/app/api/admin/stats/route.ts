import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth"; // senin yapına uygun
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  try {
    // 🔹 Oturum kontrolü
    const me = await getSessionUser();
    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (me.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🔹 Veri dosyaları
    const dataDir = path.join(process.cwd(), "data");
    const usersPath = path.join(dataDir, "users.json");
    const reviewsPath = path.join(dataDir, "reviews.json");

    // 🔹 Dosyaları oku (dosya yoksa boş dizi)
    const [usersRaw, reviewsRaw] = await Promise.all([
      fs.readFile(usersPath, "utf8").catch(() => "[]"),
      fs.readFile(reviewsPath, "utf8").catch(() => "[]"),
    ]);

    let users: any[] = [];
    let reviews: any[] = [];

    try {
      users = JSON.parse(usersRaw);
    } catch {
      users = [];
    }
    try {
      reviews = JSON.parse(reviewsRaw);
    } catch {
      reviews = [];
    }

    // 🔹 İstatistik hesapla
    const totalUsers = Array.isArray(users) ? users.length : 0;
    const bannedUsers = Array.isArray(users)
      ? users.filter((u) => u?.isDisabled || u?.status === "banned").length
      : 0;
    const totalReviews = Array.isArray(reviews) ? reviews.length : 0;

    // 🔹 Son 24 saatteki yorumlar
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const reviewsLast24h = Array.isArray(reviews)
      ? reviews.filter((r) => {
          const t = new Date(r?.createdAt || 0).getTime();
          return Number.isFinite(t) && t >= since;
        }).length
      : 0;

    // 🔹 Şehirlere göre dağılım
    const reviewsByCity: Record<string, number> = {};
    if (Array.isArray(reviews)) {
      for (const r of reviews) {
        const fromId = r?.addressId?.split("::")?.[0]?.split("-")?.[0];
        const city = r?.address?.city || fromId || "Bilinmiyor";
        reviewsByCity[city] = (reviewsByCity[city] || 0) + 1;
      }
    }

    // 🔹 Yanıt
    return NextResponse.json(
      {
        totalUsers,
        bannedUsers,
        totalReviews,
        reviewsLast24h,
        reviewsByCity,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("ADMIN /stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
