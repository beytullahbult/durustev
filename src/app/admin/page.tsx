import { headers } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // 🔹 Oturum kontrolü
  const me = await getSessionUser();
  if (!me) {
    return (
      <main className="container" style={{ padding: "2rem 1rem" }}>
        <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Yönetim Paneli</h1>
          <p className="muted">
            Bu sayfayı görmek için lütfen{" "}
            <a className="link" href="/giris">giriş yapın</a>.
          </p>
        </div>
      </main>
    );
  }

  // 🔹 Admin kontrolü
  if (me.role !== "admin") {
    return (
      <main className="container" style={{ padding: "2rem 1rem" }}>
        <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Yönetim Paneli</h1>
          <p className="muted">Bu sayfayı görüntülemek için yetki gerekli.</p>
        </div>
      </main>
    );
  }

  // 🔹 API isteği
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const apiUrl = new URL("/api/admin/stats", base);

  const res = await fetch(apiUrl.toString(), {
    cache: "no-store",
    headers: { cookie }, // session çerezini aktar
  });

  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch {}
    return (
      <main className="container" style={{ padding: "2rem 1rem" }}>
        <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Yönetim Paneli</h1>
          <div className="row" style={{ marginTop: 8 }}>
            <Link href="/admin/yonetim" className="btn btnSecondary">
              Kullanıcı & Yorum Yönetimi
            </Link>
          </div>
          <p className="muted" style={{ marginTop: 12 }}>
            İstatistikler alınamadı. <br />
            <small>
              Status: {res.status}{" "}
              {body?.error ? `– ${body.error}` : ""}
            </small>
          </p>
        </div>
      </main>
    );
  }

  const data = await res.json();

  // 🔹 Esnek veri eşleme (geri uyumlu)
  const usersStats = data.users || {};
  const reviewsStats = data.reviews || {};

  const totalUsers = usersStats.total ?? data.totalUsers ?? 0;
  const disabledUsers = usersStats.disabled ?? data.bannedUsers ?? 0;

  const totalReviews = reviewsStats.total ?? data.totalReviews ?? 0;
  const hiddenReviews = reviewsStats.hidden ?? 0;
  const deletedReviews = reviewsStats.deleted ?? 0;
  const visibleReviews = reviewsStats.visible ?? Math.max(totalReviews - hiddenReviews - deletedReviews, 0);

  const last24h = reviewsStats.last24h ?? data.reviewsLast24h ?? 0;

  // 🔹 Şehirleri alfabetik sırala (reviewsByCity bekleniyor)
  const sortedCities = Object.entries<number>(data.reviewsByCity || {}).sort(
    ([a], [b]) => a.localeCompare(b, "tr-TR", { sensitivity: "base" })
  );

  return (
    <main className="container" style={{ padding: "2rem 1rem" }}>
      <div className="card" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1
          className="sectionHead"
          style={{ color: "var(--brand)", marginBottom: 12 }}
        >
          Yönetim Paneli
        </h1>

        {/* 🔘 Yönetim sayfasına geçiş */}
        <div className="row" style={{ marginBottom: 12, gap: 8 }}>
          <Link href="/admin/yonetim" className="btn btnSecondary">
            Kullanıcı & Yorum Yönetimi
          </Link>
          <Link href="/adres/ekle" className="btn btnSecondary">Adres Ekle + Yorum Yap</Link>
        </div>

        {/* Kullanıcı istatistikleri */}
        <div className="row" style={{ gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div className="card" style={{ flex: "1 1 240px" }}>
            <div className="small muted">Toplam Kullanıcı</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{totalUsers}</div>
          </div>
          <div className="card" style={{ flex: "1 1 240px" }}>
            <div className="small muted">Pasif Kullanıcı</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{disabledUsers}</div>
          </div>
        </div>

        {/* Yorum istatistikleri (ayrıştırılmış) */}
        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="card" style={{ flex: "1 1 240px" }}>
            <div className="small muted">Görünür Yorum</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{visibleReviews}</div>
          </div>
          <div className="card" style={{ flex: "1 1 240px" }}>
            <div className="small muted">Gizli Yorum</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{hiddenReviews}</div>
          </div>
          <div className="card" style={{ flex: "1 1 240px" }}>
            <div className="small muted">Silinmiş Yorum</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{deletedReviews}</div>
          </div>
          <div className="card" style={{ flex: "1 1 240px" }}>
            <div className="small muted">Toplam Yorum</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{totalReviews}</div>
          </div>
          <div className="card" style={{ flex: "1 1 240px" }}>
            <div className="small muted">Son 24s Yorum</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{last24h}</div>
          </div>
        </div>

        {/* İl bazlı yorumlar */}
        <h2
          className="sectionHead"
          style={{ color: "var(--brand)", fontSize: 18, marginTop: 16 }}
        >
          İl Bazlı Yorumlar
        </h2>

        <div className="col" style={{ gap: 8 }}>
          {sortedCities.length === 0 ? (
            <p className="muted">Henüz veri yok.</p>
          ) : (
            sortedCities.map(([city, count]) => {
              const formattedCity = city.toLocaleUpperCase("tr-TR");
              return (
                <div
                  key={city}
                  className="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <div>{formattedCity}</div>
                  <div style={{ fontWeight: 600 }}>{count}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
