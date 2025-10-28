"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetWithTokenPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = pw1.length >= 6 && pw1 === pw2 && !loading;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: pw1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "İşlem başarısız.");

      setMsg("Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz…");
      setTimeout(() => router.replace("/giris"), 1000);
    } catch (e: any) {
      setErr(e?.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 520, padding: "2rem 0" }}>
      <div className="card" style={{ padding: "1.5rem" }}>
        <h1 className="sectionHead" style={{ color: "var(--brand)" }}>
          Yeni Şifre Belirle
        </h1>

        {msg && (
          <div className="card" style={{ marginTop: 12, borderColor: "#10b981", color: "#065f46" }}>
            {msg}
          </div>
        )}
        {err && (
          <div className="card" style={{ marginTop: 12, borderColor: "#ef4444", color: "#b91c1c" }}>
            {err}
          </div>
        )}

        <form onSubmit={submit} style={{ marginTop: 16 }}>
          <label className="label">Yeni Şifre</label>
          <input
            type="password"
            className="input"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            placeholder="En az 6 karakter"
            minLength={6}
            required
            autoComplete="new-password"
          />

          <div style={{ height: 12 }} />

          <label className="label">Yeni Şifre (Tekrar)</label>
          <input
            type="password"
            className="input"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="Tekrar girin"
            minLength={6}
            required
            autoComplete="new-password"
          />

          <div style={{ marginTop: 16 }}>
            <button className="btn btnPrimary" type="submit" disabled={!canSubmit}>
              {loading ? "Güncelleniyor…" : "Şifreyi Güncelle"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
