// app/api/addresses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

type Address = {
  id: string; city: string; district: string;
  neighborhood?: string; street?: string; buildingNo?: string;
  fullText: string; createdAt: string;
};
type Review = {
  id: string; addressId: string; userName: string; rating: number;
  comment: string; stayStart?: string; stayEnd?: string; createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const ADDR_FILE = path.join(DATA_DIR, "addresses.json");
const REV_FILE = path.join(DATA_DIR, "reviews.json");

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const f of [ADDR_FILE, REV_FILE]) {
    try { await fs.access(f); } catch { await fs.writeFile(f, "[]", "utf-8"); }
  }
}
async function readJSON<T>(fp: string): Promise<T> {
  return JSON.parse(await fs.readFile(fp, "utf-8"));
}
async function writeJSON(fp: string, data: any) {
  await fs.writeFile(fp, JSON.stringify(data, null, 2), "utf-8");
}

function trSlug(input: string) {
  const map: Record<string, string> = { ç:"c", Ç:"c", ğ:"g", Ğ:"g", ı:"i", I:"i", İ:"i", ö:"o", Ö:"o", ş:"s", Ş:"s", ü:"u", Ü:"u" };
  const s = input.replace(/./g, ch => map[ch] ?? ch).toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "adres";
}
function buildAddressId(p: Partial<Address>) {
  return trSlug([p.city,p.district,p.neighborhood,p.street,p.buildingNo].filter(Boolean).join(" "));
}

export async function GET(req: NextRequest) {
  await ensureFiles();
  const addrs = await readJSON<Address[]>(ADDR_FILE);
  const reviews = await readJSON<Review[]>(REV_FILE);

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const city = searchParams.get("city");
  const district = searchParams.get("district");

  const filtered = addrs.filter(a =>
    (!city || city === "Tümü" || a.city === city) &&
    (!district || district === "Tümü" || a.district === district) &&
    (q.length === 0 || a.fullText.toLowerCase().includes(q))
  );

  const items = filtered.map(a => {
    const rs = reviews.filter(r => r.addressId === a.id);
    const avg = rs.length ? rs.reduce((s,r)=>s+r.rating,0)/rs.length : 0;
    return {
      id:a.id, city:a.city, district:a.district,
      display:[a.city,a.district,a.neighborhood,a.street,a.buildingNo].filter(Boolean).join(" / "),
      avgRating:Number(avg.toFixed(2)), reviewCount:rs.length
    };
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  await ensureFiles();
  const b = await req.json();
  const { city, district, neighborhood, street, buildingNo } = b || {};
  if (!city || !district) return NextResponse.json({ error:"city ve district zorunlu" }, { status:400 });

  const addrs = await readJSON<Address[]>(ADDR_FILE);
  const id = buildAddressId({ city, district, neighborhood, street, buildingNo });
  if (!addrs.find(a=>a.id===id)) {
    addrs.push({
      id, city, district, neighborhood, street, buildingNo,
      fullText:[city,district,neighborhood,street,buildingNo].filter(Boolean).join(" "),
      createdAt:new Date().toISOString(),
    });
    await writeJSON(ADDR_FILE, addrs);
  }
  return NextResponse.json({ ok:true, id }, { status:201 });
}
