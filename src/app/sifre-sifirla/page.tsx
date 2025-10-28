"use client";

import { useState } from "react";

export default function RequestResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErr(null);
    setMsg(null);
    setDevLink(null);

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "İşlem başarısız.");

      setMsg(
        "Eğer bu e-posta sistemimizde kayıtlıysa sıfırlama bağlantısı e-posta adresine gönderildi."
      );

      // Geliştirme kolaylığı: backend "resetUrl" döndürür (prod'da e-posta ile gönderirsiniz)
      if (data?.resetUrl) setDevLink(data.resetUrl);
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
          Şifrenizi Sıfırlayın
        </h1>

        <p className="small" style={{ marginTop: 8 }}>
          Dürüstev hesabınıza bağlı e-posta adresini girin. Sıfırlama bağlantısı
          kayıtlı e-postaya gönderilecektir.
        </p>

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
          <label className="label">E-posta</label>
          <input
            type="email"
            className="input"
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div style={{ marginTop: 16 }}>
            <button className="btn btnPrimary" type="submit" disabled={loading}>
              {loading ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
            </button>
          </div>
        </form>

        {devLink && (
          <div className="small" style={{ marginTop: 12 }}>
            <strong>Geliştirme kolaylığı:</strong>{" "}
            <a className="underline" href={devLink}>
              Sıfırlama bağlantısı (dev)
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
