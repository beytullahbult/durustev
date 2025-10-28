import { headers } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const me = await getSessionUser();
  if (!me) {
    return (
      <main className="container" style={{ padding: "2rem 1rem" }}>
        <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Yorum Yönetimi</h1>
          <p className="muted">Bu sayfayı görmek için lütfen <a className="link" href="/giris">giriş yapın</a>.</p>
        </div>
      </main>
    );
  }
  if (me.role !== "admin") {
    return (
      <main className="container" style={{ padding: "2rem 1rem" }}>
        <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Yorum Yönetimi</h1>
          <p className="muted">Bu sayfayı görüntülemek için yetki gerekli.</p>
        </div>
      </main>
    );
  }

  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const apiUrl = new URL("/api/admin/reviews", base);

  const res = await fetch(apiUrl.toString(), {
    cache: "no-store",
    headers: { cookie },
  });

  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch {}
    return (
      <main className="container" style={{ padding: "2rem 1rem" }}>
        <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Yorum Yönetimi</h1>
          <p className="muted">Veriler alınamadı. <small>Status: {res.status} {body?.error ? `– ${body.error}` : ""}</small></p>
        </div>
      </main>
    );
  }

  const initial = await res.json();

  return (
    <main className="container" style={{ padding: "2rem 1rem" }}>
      <div className="card" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Yorum Yönetimi</h1>
          <div className="row" style={{ gap: 8 }}>
            <a className="btn" href="/admin">← Panele Dön</a>
          </div>
        </div>
        <ReviewsClient initialItems={initial} />
      </div>
    </main>
  );
}
