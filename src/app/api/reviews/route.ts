// src/app/api/reviews/route.ts
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

// ---- Arama yardımcıları (TR normalizasyonu + alan toplama) ----
function norm(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/\s+/g, " ")
    .trim();
}
function toUpperTR(s?: string) {
  return (s || "").toString().trim().toLocaleUpperCase("tr-TR");
}
function cityFromRecord(r: any) {
  return toUpperTR(r.city ?? r.il);
}
function districtFromRecord(r: any) {
  return toUpperTR(r.district ?? r.ilce ?? r.mahalle);
}
function parseCityDistrictFromAddressId(addressId?: string) {
  if (!addressId) return { city: "", district: "" };
  const delim = addressId.includes("::") ? "::" : addressId.includes("/") ? "/" : "-";
  const parts = addressId.split(delim).map((t) => t.trim()).filter(Boolean);
  const city = toUpperTR(parts[0]);
  const district = toUpperTR(parts[1]);
  return { city, district };
}
function textForSearch(r: any): string {
  const fields = [
    r.text, r.comment, r.content, r.body, r.description, r.review,
    r.userName, r.user, r.author, r.userEmail,
    r.addressId, r.city, r.il, r.ilce, r.district, r.mahalle, r.title,
  ].filter(Boolean);
  return norm(fields.join(" "));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const statusParam = (url.searchParams.get("status") || "visible").toLowerCase(); // visible|hidden|deleted|all
  const cityParam = toUpperTR(url.searchParams.get("city") || "");
  const districtParam = toUpperTR(url.searchParams.get("district") || "");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);

  const all = await readAll();

  // 1) Status filtresi — status yoksa "visible" say (eski kayıt uyumu)
  const statusFiltered = all.filter((r) => {
    const s = (r.status ?? "visible").toString().toLowerCase();
    if (statusParam === "all") return true;
    return s === statusParam;
  });

  // 2) Şehir/ilçe filtresi — hem ayrı alanlardan hem addressId'den yakala
  const geoFiltered = statusFiltered.filter((r) => {
    if (!cityParam && !districtParam) return true;

    const rc = cityFromRecord(r);
    const rd = districtFromRecord(r);
    const { city: ac, district: ad } = parseCityDistrictFromAddressId(r.addressId);

    const hitCity = cityParam ? (rc === cityParam || ac === cityParam) : true;
    const hitDist = districtParam ? (rd === districtParam || ad === districtParam) : true;
    return hitCity && hitDist;
  });

  // 3) Metin araması
  const nq = norm(q);
  const matched = nq ? geoFiltered.filter((r) => textForSearch(r).includes(nq)) : geoFiltered;

  const total = matched.length;
  const items = matched.slice(offset, offset + limit);

  return NextResponse.json({ total, items, offset, limit });
}
