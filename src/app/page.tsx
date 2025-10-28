// src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CityRow = { sehir_id: string; sehir_adi: string };
type DistrictRow = { ilce_id: string; ilce_adi: string; sehir_id: string; sehir_adi?: string };

type Address = { id?: string; city?: string; district?: string; display?: string } | null | undefined;
type ReviewRow = {
  id: string;
  addressId?: string;
  userName?: string;
  rating?: number;
  comment?: string;
  stayStart?: string;
  stayEnd?: string;
  createdAt?: string;
  address?: Address;
};

const CITIES_FALLBACK = [
  "ADANA","ADIYAMAN","AFYONKARAHİSAR","AĞRI","AMASYA","ANKARA","ANTALYA","ARTVİN","AYDIN","BALIKESİR","BİLECİK",
  "BİNGÖL","BİTLİS","BOLU","BURDUR","BURSA","ÇANAKKALE","ÇANKIRI","ÇORUM","DENİZLİ","DİYARBAKIR","EDİRNE","ELAZIĞ",
  "ERZİNCAN","ERZURUM","ESKİŞEHİR","GAZİANTEP","GİRESUN","GÜMÜŞHANE","HAKKARİ","HATAY","ISPARTA","MERSİN","İSTANBUL",
  "İZMİR","KARS","KASTAMONU","KAYSERİ","KIRKLARELİ","KIRŞEHİR","KOCAELİ","KONYA","KÜTAHYA","MALATYA","MANİSA",
  "KAHRAMANMARAŞ","MARDİN","MUĞLA","MUŞ","NEVŞEHİR","NİĞDE","ORDU","RİZE","SAKARYA","SAMSUN","SİİRT","SİNOP","SİVAS",
  "TEKİRDAĞ","TOKAT","TRABZON","TUNCELİ","ŞANLIURFA","UŞAK","VAN","YOZGAT","ZONGULDAK","AKSARAY","BAYBURT","KARAMAN",
  "KIRIKKALE","BATMAN","ŞIRNAK","BARTIN","ARDAHAN","IĞDIR","YALOVA","KARABÜK","KİLİS","OSMANİYE","DÜZCE"
];

/* ----------------- Yardımcılar ----------------- */
function normalizeTR(s: string) {
  return (s || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function toTitleTR(s?: string) {
  if (!s) return "";
  const cleaned = s.replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned
    .split(" ")
    .map((w) => w.slice(0, 1).toLocaleUpperCase("tr-TR") + w.slice(1).toLocaleLowerCase("tr-TR"))
    .join(" ");
}
function toUpperTR(s?: string) {
  return (s || "").replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim().toLocaleUpperCase("tr-TR");
}
function parseFromAddressId(id?: string) {
  if (!id) return { city: "", district: "", rest: "" };
  const delim = id.includes("::") ? "::" : id.includes("/") ? "/" : "-";
  const parts = id.split(delim).map((t) => t.trim()).filter(Boolean);
  const cityRaw = parts[0] || "";
  const distRaw = parts[1] || "";
  const restRaw = parts.slice(2).join(" ");
  return { city: toUpperTR(cityRaw), district: toUpperTR(distRaw), rest: toTitleTR(restRaw) };
}
function fmtDate(s?: string) {
  if (!s) return "";
  const t = Date.parse(s);
  return isFinite(t) ? new Date(t).toLocaleDateString("tr-TR") : "";
}
function titleFromReview(r: ReviewRow): string {
  const a = r.address ?? undefined;
  if (a?.display && a.display.trim()) return a.display;
  const { city, district, rest } = parseFromAddressId(r.addressId);
  const left = [city, district].filter(Boolean).join(" / ");
  if (left && rest) return `${left} — ${rest}`;
  if (left) return left;
  return "Adres bilgisi yok";
}

/* ----------------- Bileşen ----------------- */
export default function HomePage() {
  // şehir/ilçe veri
  const [cities, setCities] = useState<string[]>(["Tümü"]);
  const [districtsMap, setDistrictsMap] = useState<Record<string, string[]>>({});
  const [loadingGeo, setLoadingGeo] = useState(true);

  // filtreler
  const [city, setCity] = useState("Tümü");
  const [district, setDistrict] = useState("Tümü");
  const [q, setQ] = useState("");

  // sonuçlar
  const [results, setResults] = useState<ReviewRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ŞEHİR/İLÇE yükleme
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cRes, dRes] = await Promise.all([fetch("/sehirler.json"), fetch("/ilceler.json")]);
        const cRows: CityRow[] = cRes.ok ? await cRes.json() : [];
        const dRows: DistrictRow[] = dRes.ok ? await dRes.json() : [];

        let cityNames = cRows.map(c => (c.sehir_adi || "").toString().trim()).filter(Boolean);
        if (!cityNames.length && dRows.length) {
          const set = new Set(dRows.map(d => (d.sehir_adi || "").toString().trim()).filter(Boolean));
          cityNames = Array.from(set);
        }
        cityNames = cityNames.map(s => s.toLocaleUpperCase("tr-TR")).sort((a,b)=>a.localeCompare(b,"tr"));

        const map: Record<string,string[]> = {};
        for (const d of dRows) {
          const cname = (d.sehir_adi || "").toString().trim().toLocaleUpperCase("tr-TR");
          const dname = (d.ilce_adi || "").toString().trim();
          if (!cname || !dname) continue;
          (map[cname] ||= []).push(dname);
        }
        Object.keys(map).forEach(k => map[k].sort((a,b)=>a.localeCompare(b,"tr")));

        if (alive) {
          setCities(["Tümü", ...(cityNames.length ? cityNames : CITIES_FALLBACK)]);
          setDistrictsMap(map);
        }
      } finally {
        if (alive) setLoadingGeo(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const districts = useMemo(() => {
    if (city !== "Tümü" && districtsMap[city]) return ["Tümü", ...districtsMap[city]];
    return ["Tümü"];
  }, [city, districtsMap]);

  // ✅ SAĞLAM ARAMA: /api/reviews/search kullan
  async function onSearch() {
    setSearching(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (city && city !== "Tümü") params.set("city", city);         // büyük harfli de çalışıyor
      if (city && city !== "Tümü" && district && district !== "Tümü") {
        params.set("district", district);
      }
      params.set("status", "visible");    // status olmayan eski kayıtları da visible sayan endpoint ile uyumlu
      params.set("limit", "200");

      const url = `/api/reviews/search?${params.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();

      // HTML dönerse (404/401) yakala
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = null; }
      if (!res.ok) {
        const reason = data?.error || text?.slice(0,200) || "Arama başarısız.";
        throw new Error(`${res.status} – ${reason}`);
      }

      const items: ReviewRow[] = Array.isArray(data?.items) ? data.items : [];
      setResults(items);
    } catch (e:any) {
      setError(e?.message || "Bir hata oluştu.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function onKeyDownInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  }

  // 🔒 render güvenliği
  const list = Array.isArray(results) ? results : [];

  return (
    <main className="container">
      <div className="layout">
        {/* SOL: filtreler */}
        <aside className="sidebar stickyTop" aria-label="Filtreler">
          <h1 className="slogan" style={{ color: "var(--brand)" }}>
            Güvenilir Ev Sahibi,<br/>Güvenilir Kiracı
          </h1>

          <h2 className="sectionHead">Yorum Ara</h2>

          <div className="col">
            <label className="small" htmlFor="city">Şehir</label>
            <select
              id="city"
              lang="tr"
              className="select select--lg"
              value={city}
              onChange={(e) => { setCity(e.target.value); setDistrict("Tümü"); }}
              disabled={loadingGeo}
            >
              {cities.map((c, idx) => <option key={`${c}-${idx}`} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="col" style={{ marginTop: 12 }}>
            <label className="small" htmlFor="district">İlçe</label>
            <select
              id="district"
              lang="tr"
              className="select select--lg"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={loadingGeo || city === "Tümü"}
            >
              {(city === "Tümü" ? ["Tümü"] : ["Tümü", ...(districtsMap[city] || [])]).map((d, idx) => (
                <option key={`${d}-${idx}`} value={d}>{d}</option>
              ))}
            </select>
            {city === "Tümü" && (
              <div className="small">Şehir “Tümü” iken ilçe seçimi devre dışı.</div>
            )}
          </div>

          <div className="col" style={{ marginTop: 12 }}>
            <label className="small" htmlFor="q">Adres / Anahtar Kelime</label>
            <input
              id="q"
              className="input"
              placeholder="Yorumlarda geçen bir kelime…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDownInput}
            />
            <div className="small">Bu alan yalnızca <strong>yorum metninde</strong> aranır.</div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btnPrimary btnBlock" onClick={onSearch} disabled={searching}>
              {searching ? "Aranıyor…" : "Ara"}
            </button>
          </div>

          <div className="divider" />

          <Link href="/adres/ekle" className="btn btnBlock">Adres Ekle + Yorum Yap</Link>
          <div className="small" style={{ marginTop: 6 }}>
            Yorum eklemek için önce adresini gir.
          </div>
        </aside>

        {/* SAĞ: sonuçlar */}
        <section aria-label="Yorum Sonuçları">
          <div className="col" style={{ marginBottom: 16 }}>
            <h2 className="sectionHead" style={{ marginBottom: 4 }}>Yorum Sonuçları</h2>
            <div className="small">Filtreye uyan adres yorumları listelenir.</div>
          </div>

          {searching && <div className="card">Aranıyor…</div>}
          {error && !searching && (
            <div className="card" style={{ borderColor:"#ef4444", color:"#b91c1c" }}>
              {error}
            </div>
          )}
          {!searching && !error && (list.length === 0 ? (
            <div className="card">Henüz arama yapmadınız ya da sonuç bulunamadı.</div>
          ) : (
            <ul className="gridCards" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {list.map((r) => {
                const a = r.address ?? undefined;
                const title = titleFromReview(r);

                const fallback = parseFromAddressId(r.addressId);
                const line2Left =
                  [a?.city?.trim(), a?.district?.trim()].filter(Boolean).join(" / ") ||
                  [fallback.city, fallback.district].filter(Boolean).join(" / ");
                const dateStr = fmtDate(r.createdAt);
                const line2 = [line2Left || undefined, dateStr || undefined].filter(Boolean).join(" — ");

                return (
                  <li key={r.id} className="card">
                    <div style={{ fontWeight: 700 }}>{title}</div>
                    {line2 && (
                      <div className="muted" style={{ marginTop: 4 }}>
                        {line2}
                      </div>
                    )}

                    <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                      <div style={{ fontWeight: 600 }}>{r.userName || "Anonim"}</div>
                      <div className="small">Puan: {typeof r.rating === "number" ? r.rating : "-"}</div>
                    </div>

                    {r.comment && (
                      <p className="muted" style={{ whiteSpace: "pre-line", marginTop: 8 }}>
                        {r.comment}
                      </p>
                    )}

                    {(r.stayStart || r.stayEnd) && (
                      <div className="small" style={{ marginTop: 6 }}>
                        Kaldığı dönem: {r.stayStart || "?"} — {r.stayEnd || "?"}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </section>
      </div>
    </main>
  );
}
