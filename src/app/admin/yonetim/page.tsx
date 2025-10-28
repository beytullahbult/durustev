"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type AdminUser = {
  id: string;
  email: string;
  name?: string;
  role?: "user" | "admin";
  isDisabled?: boolean;
  isVerified?: boolean;
  createdAt?: string;
};

type Review = {
  id: string;
  userId?: string;
  addressId?: any; // bazen string bazen nesne gelebilir
  text?: any;
  rating?: number;
  createdAt?: string;
  status?: "visible" | "hidden" | "deleted";
  // API bazı alanları farklı isimlerle döndürebilir
  displayUser?: any;
  displayText?: any;
};

function asDisplay(value: any): string {
  if (value == null) return "-";
  if (typeof value === "string") {
    const s = value.trim();
    return s.length ? s : "-";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    // dizi ise elemanları virgülle birleştir
    const joined = value.map((v) => asDisplay(v)).filter((s) => s !== "-").join(", ");
    return joined || "-";
  }
  if (typeof value === "object") {
    // name > email > title > id > toString
    const name = value.name ?? value.fullName ?? value.username;
    const email = value.email ?? value.userEmail;
    const title = value.title ?? value.label;
    const id = value.id ?? value._id ?? value.userId;
    const pick = name ?? email ?? title ?? id;
    if (pick != null) return asDisplay(pick);
    // son çare: JSON kısa gösterim (çok uzun olmasın diye)
    try {
      const s = JSON.stringify(value);
      return s && s !== "{}" ? s : "-";
    } catch {
      return "-";
    }
  }
  return "-";
}

export default function AdminYonetimPage() {
  const [tab, setTab] = useState<"users" | "reviews">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    setActionMsg(null);
    try {
      const res = await fetch("/api/admin/summary", { cache: "no-store" });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch {}
      if (!res.ok) {
        const reason = data?.error || text?.slice(0, 200) || "Veriler yüklenemedi.";
        throw new Error(`${res.status} – ${reason}`);
      }
      if (!data || typeof data !== "object") throw new Error("Geçersiz yanıt (JSON).");
      setUsers(data.users || []);
      setReviews(data.reviews || []);
    } catch (e: any) {
      setErr(e?.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateUser(u: AdminUser, patch: Partial<AdminUser>) {
    setActionMsg(null); setErr(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, ...patch }),
      });
      const text = await res.text();
      let data: any = null; try { data = JSON.parse(text); } catch {}
      if (!res.ok) throw new Error(`${res.status} – ${data?.error || text?.slice(0,200) || "Kullanıcı güncellenemedi."}`);
      setActionMsg("Kullanıcı güncellendi.");
      await load();
    } catch (e:any) { setErr(e?.message || "Kullanıcı güncellenemedi."); }
  }

  async function updateReview(r: Review, action: "hide" | "show" | "delete") {
    setActionMsg(null); setErr(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, action }),
      });
      const text = await res.text();
      let data: any = null; try { data = JSON.parse(text); } catch {}
      if (!res.ok) throw new Error(`${res.status} – ${data?.error || text?.slice(0,200) || "Yorum güncellenemedi."}`);
      setActionMsg("Yorum güncellendi.");
      await load();
    } catch (e:any) { setErr(e?.message || "Yorum güncellenemedi."); }
  }

  const visibleReviews = useMemo(
    () => reviews.filter((r) => r.status !== "deleted"),
    [reviews]
  );

  return (
    <main className="container" style={{ padding: "2rem 1rem" }}>
      <div className="card" style={{ width: "100%", margin: "0 auto", padding: "1rem" }}>
        {/* Üst araç çubuğu */}
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)", marginRight: "auto" }}>
            Yönetim – Kullanıcı & Yorum
          </h1>
          <Link href="/admin" className="btn btnSecondary">Dashboard</Link>
          <button className="btn btnSecondary" onClick={load}>Yenile</button>
        </div>

        {/* Sekmeler */}
        <div className="row" style={{ gap: 8, marginTop: 12 }}>
          <button
            className={`btn ${tab === "users" ? "btnPrimary" : "btnSecondary"}`}
            onClick={() => setTab("users")}
          >
            Kullanıcılar
          </button>
          <button
            className={`btn ${tab === "reviews" ? "btnPrimary" : "btnSecondary"}`}
            onClick={() => setTab("reviews")}
          >
            Yorumlar
          </button>
        </div>

        {/* Mesajlar */}
        {err && (
          <div className="card" style={{ borderColor: "#ef4444", color: "#b91c1c", marginTop: 12 }}>
            {err}
          </div>
        )}
        {actionMsg && (
          <div className="card" style={{ borderColor: "#10b981", color: "#065f46", marginTop: 12 }}>
            {actionMsg}
          </div>
        )}

        {loading && <div className="muted" style={{ marginTop: 12 }}>Yükleniyor…</div>}

        {/* KULLANICILAR */}
        {!loading && tab === "users" && (
          <div className="tableWrap" style={{ marginTop: 12 }}>
            <div className="tableScroller noScroll">
              <table className="table adminTable fitTable">
                <thead>
                  <tr>
                    <th>E-posta</th>
                    <th>Ad</th>
                    <th>Rol</th>
                    <th>Durum</th>
                    <th>Oluşturulma</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="wrap">{asDisplay(u.email)}</td>
                      <td className="wrap">{asDisplay(u.name)}</td>
                      <td>
                        <span className={`badge ${u.role === "admin" ? "badgeAdmin" : ""}`}>
                          {asDisplay(u.role || "user")}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isDisabled ? "badgeWarn" : "badgeOk"}`}>
                          {u.isDisabled ? "Pasif" : "Aktif"}
                        </span>
                      </td>
                      <td className="wrap">{asDisplay(u.createdAt?.slice(0,19).replace("T"," "))}</td>
                      <td>
                        <div className="btnGroup">
                          <button
                            className="btn btnSecondary"
                            onClick={() => updateUser(u, { role: (u.role === "admin" ? "user" : "admin") })}
                          >
                            {u.role === "admin" ? "User Yap" : "Admin Yap"}
                          </button>
                          <button
                            className="btn btnSecondary"
                            onClick={() => updateUser(u, { isDisabled: !u.isDisabled })}
                          >
                            {u.isDisabled ? "Aktifleştir" : "Pasifleştir"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="muted">Kayıt yok</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* YORUMLAR */}
        {!loading && tab === "reviews" && (
          <div className="tableWrap" style={{ marginTop: 12 }}>
            <div className="tableScroller noScroll">
              <table className="table adminTable fitTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Kullanıcı</th>
                    <th>Adres</th>
                    <th>Puan</th>
                    <th>Metin</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReviews.map((r) => (
                    <tr key={r.id}>
                      <td className="mono wrap">{asDisplay(r.id)}</td>
                      <td className="wrap">{asDisplay(r.displayUser ?? r.userId)}</td>
                      <td className="wrap">{asDisplay(r.addressId)}</td>
                      <td style={{ textAlign: "center" }}>{asDisplay(r.rating ?? "-")}</td>
                      <td className="wrap">{asDisplay(r.displayText ?? r.text)}</td>
                      <td>
                        <span className={`badge ${
                          r.status === "hidden" ? "badgeWarn" :
                          r.status === "deleted" ? "badgeDanger" : "badgeOk"
                        }`}>
                          {asDisplay(r.status ?? "visible")}
                        </span>
                      </td>
                      <td className="wrap">
                        {asDisplay(r.createdAt?.slice(0, 19).replace("T", " "))}
                      </td>
                      <td>
                        <div className="btnGroup">
                          <button
                            className="btn btnSecondary"
                            onClick={() => updateReview(r, r.status === "hidden" ? "show" : "hide")}
                          >
                            {r.status === "hidden" ? "Göster" : "Gizle"}
                          </button>
                          <button
                            className="btn btnDanger"
                            onClick={() => updateReview(r, "delete")}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleReviews.length === 0 && (
                    <tr>
                      <td colSpan={8} className="muted">Kayıt yok</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Stil: kaydırmasız, satır içi kırılım */}
      <style jsx>{`
        .tableScroller {
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,.06);
          background: #fff;
        }
        .tableScroller.noScroll { overflow: visible; }

        .adminTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
        }
        .adminTable thead th {
          position: sticky;
          top: 0;
          background: #f8fafc;
          z-index: 1;
          text-align: left;
          font-weight: 700;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .adminTable tbody td {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(0,0,0,.04);
          vertical-align: top;
        }
        .adminTable tbody tr:nth-child(even) td { background: #fafafa; }
        .adminTable tbody tr:hover td { background: #f5f7fb; }

        .wrap { white-space: normal; word-break: break-word; overflow-wrap: anywhere; }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .btnGroup { display: flex; gap: 8px; flex-wrap: wrap; }

        .badge {
          display: inline-block; padding: 2px 8px; border-radius: 999px;
          font-size: 12px; line-height: 18px; background: #eef2ff; color: #3730a3;
          font-weight: 600; border: 1px solid rgba(0,0,0,.06);
        }
        .badgeOk { background: #ecfdf5; color: #065f46; }
        .badgeWarn { background: #fff7ed; color: #9a3412; }
        .badgeDanger { background: #fee2e2; color: #991b1b; }
        .badgeAdmin { background: #dbeafe; color: #1e3a8a; }

        @media (max-width: 720px) {
          .adminTable thead th, .adminTable tbody td { padding: 8px 10px; }
        }
      `}</style>
    </main>
  );
}
