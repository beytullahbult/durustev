"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type CityRow = { sehir_id: string; sehir_adi: string };
type DistrictRow = { ilce_id: string; ilce_adi: string; sehir_id: string; sehir_adi?: string };
type UserMe = { uid?: string; id?: string; email: string; name?: string } | null;

// ---------------- Profanity yardımcıları (senin kodun) ----------------
function normalizeTRClient(input: string) {
  const map: Record<string, string> = {
    "ş":"s","Ş":"s","ı":"i","I":"i","İ":"i",
    "ö":"o","Ö":"o","ü":"u","Ü":"u",
    "ç":"c","Ç":"c","ğ":"g","Ğ":"g",
    "á":"a","à":"a","ä":"a","â":"a",
    "é":"e","è":"e","ë":"e","ê":"e",
    "ó":"o","ò":"o","ô":"o","ú":"u","ù":"u","û":"u"
  };
  const leet: Record<string, string> = { "0":"o","1":"i","3":"e","4":"a","5":"s","7":"t","$":"s","@":"a" };
  let s = (input || "")
    .replace(/\s+/g, " ")
    .replace(/(.)\1{2,}/g, "$1$1");
  s = [...s].map(ch => (map[ch] ?? leet[ch] ?? ch)).join("");
  return s.toLowerCase();
}
function looseWordRegex(word: string) {
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const between = "[\\s_\\-\\.\\*]{0,2}";
  return new RegExp(`\\b${esc.split("").join(between)}\\b`, "i");
}
const BASE_PROFANITY: RegExp[] = [
  /orospu|pezev|ibne|yarr?ak|amk\b|aq\b|mk\b|sik[tg]|\bsikt|boktan|kufur|kufr|kuf?r/i,
  /salak|aptal|gerizekal[ıi]|mal[ıi]?|haysiyetsiz|serefsiz|kahpe/i,
];
function containsProfanityClient(raw: string) {
  if (!raw || raw.length < 2) return false;
  const n = normalizeTRClient(raw);
  if (BASE_PROFANITY.some(rx => rx.test(n))) return true;
  const seeds = ["sik", "amk", "orospu", "pezevenk", "yarrak", "ibne", "aq"];
  return seeds.some(w => looseWordRegex(normalizeTRClient(w)).test(n));
}
// ---------------------------------------------------------------------

export default function AddAddressPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [cities, setCities] = useState<string[]>([]);
  const [districtsMap, setDistrictsMap] = useState<Record<string, string[]>>({});

  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNo, setBuildingNo] = useState("");

  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [stayStart, setStayStart] = useState("");
  const [stayEnd, setStayEnd] = useState("");

  const [badComment, setBadComment] = useState(false);

  // 🔑 me: undefined (yükleniyor) | null (giriş yok) | obj (giriş var)
  const [me, setMe] = useState<UserMe | undefined>(undefined);

  const commentRemain = Math.max(0, 1000 - comment.length);

  // ⭐️ Yıldız hover durumu (yalnızca puanlama için)
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // oturum kontrolü
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        if (!r.ok) { if (!abort) setMe(null); return; }
        const data = await r.json();
        if (!abort) {
          // 👇 endpoint { me } veya { user } dönebilir; ikisini de destekle
          const m = (data?.me ?? data?.user ?? null) as UserMe;
          setMe(m);
          if (m?.name) setUserName(m.name);
        }
      } catch {
        if (!abort) setMe(null);
      }
    })();
    return () => { abort = true; };
  }, []);

  // şehir/ilçe yükleme
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cRes, dRes] = await Promise.all([fetch("/sehirler.json"), fetch("/ilceler.json")]);
        const cRows: CityRow[] = cRes.ok ? await cRes.json() : [];
        const dRows: DistrictRow[] = dRes.ok ? await dRes.json() : [];

        let cityNames = cRows.map((c) => c.sehir_adi?.trim()).filter(Boolean) as string[];
        if (cityNames.length === 0 && dRows.length) {
          const set = new Set(dRows.map((d) => d.sehir_adi?.trim()).filter(Boolean) as string[]);
          cityNames = Array.from(set);
        }
        cityNames = cityNames
          .map((s) => s.toLocaleUpperCase("tr-TR"))
          .sort((a, b) => a.localeCompare(b, "tr"));

        const map: Record<string, string[]> = {};
        for (const d of dRows) {
          const cname = d.sehir_adi?.trim().toLocaleUpperCase("tr-TR");
          const dname = d.ilce_adi?.trim();
          if (!cname || !dname) continue;
          (map[cname] ||= []).push(dname);
        }
        Object.keys(map).forEach((k) => (map[k] = map[k].sort((a, b) => a.localeCompare(b, "tr"))));

        if (!alive) return;
        setCities(cityNames);
        setDistrictsMap(map);

        const defCity = cityNames[0] || "";
        setCity((prev) => prev || defCity);
        setDistrict((prev) => prev || map[defCity]?.[0] || "");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const districts = useMemo(() => districtsMap[city] || [], [city, districtsMap]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!city) return setError("Lütfen şehir seçin.");
    if (comment.trim().length < 20) return setError("Yorum en az 20 karakter olmalı.");
    if (badComment) return setError("Yorumda uygunsuz ifade tespit edildi.");

    setSaving(true);
    setError(null);
    setSuccess(null);

    const addressId = [city, district, neighborhood, street, buildingNo].filter(Boolean).join("::");
    const display = [city, district].filter(Boolean).join(" / ");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include", // 👈 çerezin kesin gitmesi için
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId,
          address: { id: addressId, city, district: district || undefined, display },
          userName,
          rating,
          comment,
          stayStart: stayStart || null,
          stayEnd: stayEnd || null,
        }),
      });

      if (res.status === 401) {
        setError("Yorum eklemek için giriş yapmalısınız.");
        return;
      }
      if (res.status === 409) {
        setError("Bu yorum zaten kayıtlı (48 saat kuralı).");
        return;
      }
      if (!res.ok) {
        const raw = await res.text();
        setError(raw || `İstek başarısız (status ${res.status})`);
        return;
      }

      setNeighborhood(""); setStreet(""); setBuildingNo("");
      setUserName(me?.name ?? ""); setRating(5); setComment("");
      setStayStart(""); setStayEnd(""); setBadComment(false);
      setSuccess("Yorum başarıyla kaydedildi.");
    } catch {
      setError("Ağ hatası veya beklenmeyen bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  // ---------- RENDER KOŞULLARI ----------
  if (me === undefined) {
    return null;
  }

  if (me === null) {
    return (
      <main className={styles.container}>
        <div className={styles.formCard}>
          <h1 className={`sectionHead ${styles.customHead}`}>Adres Bilgilerini Girip Yorum Yapabilirsiniz</h1>
          <p className={styles.lead}>Önceden oturduğunuz adres için puan ve yorum bırakın. Takma isim kullanabilirsiniz.</p>
          <div className={`${styles.alert} ${styles.alertError}`} style={{ marginTop: 16 }}>
            Yorum ekleyebilmek için <a href="/giris" className="link">giriş yapmalısınız</a>.
          </div>
        </div>
      </main>
    );
  }

  // 3) me dolu -> formu göster
  return (
    <main className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={`sectionHead ${styles.customHead}`}>Adres Bilgilerini Girip Yorum Yapabilirsiniz</h1>
        <p className={styles.lead}>
          Önceden oturduğunuz adres için puan ve yorum bırakın. Takma isim kullanabilirsiniz.
        </p>

        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
        {success && <div className={`${styles.alert} ${styles.alertOk}`}>{success}</div>}

        <form onSubmit={onSubmit} className={styles.form}>
          {/* Şehir / İlçe */}
          <div className={styles.row}>
            <div>
              <label className="small">Şehir</label>
              <select
                className="select select--lg"
                value={city}
                onChange={(e) => {
                  const v = e.target.value;
                  setCity(v);
                  setDistrict(districtsMap[v]?.[0] || "");
                }}
                disabled={loading || !cities.length}
                required
              >
                {cities.map((c, idx) => (
                  <option key={`${c}-${idx}`} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="small">İlçe</label>
              <select
                className="select select--lg"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={loading || !districts.length}
              >
                {districts.map((d, idx) => (
                  <option key={`${d}-${idx}`} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Adres */}
          <div className={styles.row}>
            <input className="input" placeholder="Mahalle" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
            <input className="input" placeholder="Cadde/Sokak" value={street} onChange={(e) => setStreet(e.target.value)} />
            <input className="input" placeholder="Bina No" value={buildingNo} onChange={(e) => setBuildingNo(e.target.value)} />
          </div>

          {/* Kullanıcı + Puan */}
          <div className={styles.row}>
            <input
              className="input"
              placeholder="Ad / Takma Ad"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />

            {/* ⭐️ Yıldızlı Puanlama (1–5) */}
            <div>
              <label className="small" htmlFor="rating-group">Genel Puan (1–5)</label>
              <div
                id="rating-group"
                className={styles.rating}
                role="radiogroup"
                aria-label="Genel puan"
                aria-describedby="rating-help"
              >
                {[1, 2, 3, 4, 5].map((n) => {
                  const current = hoverRating !== null ? hoverRating : rating;
                  const active = current >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-label={`${n} yıldız`}
                      aria-checked={rating === n}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(null)}
                      onFocus={() => setHoverRating(n)}
                      onBlur={() => setHoverRating(null)}
                      onClick={() => setRating(n)}
                      className={`${styles.star} ${active ? styles.starActive : ""}`}
                    >
                      {active ? "★" : "☆"}
                    </button>
                  );
                })}
                <span className={styles.ratingValue}>{rating}/5</span>
              </div>
              <div id="rating-help" className="small" style={{ marginTop: 4, opacity: 0.75 }}>
                Bu adres için genel memnuniyet puanınız. 1 = Kötü, 5 = Mükemmel.
              </div>
            </div>
          </div>

          {/* Tarihler */}
          <div className={styles.row}>
            <input type="month" className="input" value={stayStart} onChange={(e) => setStayStart(e.target.value)} />
            <input type="month" className="input" value={stayEnd} onChange={(e) => setStayEnd(e.target.value)} />
          </div>

          {/* Yorum */}
          <div>
            <textarea
              className="input"
              style={{ minHeight: 120 }}
              maxLength={1000}
              value={comment}
              onChange={(e) => {
                const v = e.target.value;
                setComment(v);
                setBadComment(containsProfanityClient(v));
              }}
              placeholder={`Yorumunuzu yazın (en az 20 karakter)`}
              required
            />
            {badComment && (
              <div className={`${styles.alert} ${styles.alertError}`} style={{ marginTop: 8 }}>
                Uygunsuz ifade tespit edildi. Bu şekilde kaydedemezsiniz.
              </div>
            )}
          </div>

          {/* Buton */}
          <div className={styles.actions}>
            <button
              type="submit"
              className={`btn btnPrimary ${styles.primaryBtn}`}
              disabled={saving || badComment}
            >
              {saving ? "Kaydediliyor…" : "Yorum Yap"}
            </button>
          </div>
        </form>

        {/* (İsteğe bağlı) Karakter sayacı */}
        {/* <div className="small" style={{ marginTop: 8, opacity: .6 }}>Kalan karakter: {commentRemain}</div> */}
      </div>
    </main>
  );
}
