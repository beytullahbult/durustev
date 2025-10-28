"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailNorm = useMemo(() => email.trim().toLowerCase(), [email]);
  const formInvalid = useMemo(() => {
    if (!isValidEmail(emailNorm)) return true;
    if (!pw) return true;
    return false;
  }, [emailNorm, pw]);

  // KVKK/Kullanım Koşulları geri dönüşünde /giris'e dönmesi için iz bırak
  useEffect(() => {
    try {
      sessionStorage.setItem("durustev:lastAuth", "/giris");
    } catch {}
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!isValidEmail(emailNorm) || !pw) {
      setError("E-posta ve şifre zorunludur.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailNorm, password: pw }),
      });

      const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}

      if (res.status === 401) {
        setError(data?.error || "E-posta veya şifre hatalı.");
        return;
      }
      if (!res.ok) {
        setError(data?.error || raw || `İstek başarısız (${res.status}).`);
        return;
      }

      // Başarılı giriş
      router.replace("/");
    } catch {
      setError("Ağ hatası ya da beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 520, padding: "2rem 0" }}>
      <div className="card" style={{ padding: "1.5rem" }}>
        <h1 className="sectionHead" style={{ color: "var(--brand)" }}>
          Giriş Yap
        </h1>

        <p className="small" style={{ marginTop: 8 }}>
          Dürüstev’de yorumlar <strong>herkese açık</strong> olarak görünür. Yorum eklemek ve
          kendi yorumlarını yönetmek için giriş yap.
        </p>

        {error && (
          <div
            className="card"
            style={{ borderColor: "#ef4444", color: "#b91c1c", marginTop: 12, marginBottom: 4 }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ marginTop: "1rem" }}>
          <label className="label">E-posta</label>
          <input
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!!email && !isValidEmail(emailNorm) && (
            <div className="small" style={{ color: "#b91c1c", marginTop: 6 }}>
              Geçerli bir e-posta girin.
            </div>
          )}

          <div style={{ height: 12 }} />

          <label className="label">Parola</label>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            placeholder="Parolanız"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />

          <div className="small muted" style={{ marginTop: 12 }}>
            Devam ederek{" "}
            <Link href="/kullanim-sartlari?from=giris" className="underline">
              Kullanım Koşulları
            </Link>{" "}
            ve{" "}
            <Link href="/kvkk?from=giris" className="underline">
              KVKK Aydınlatma Metni
            </Link>
            ’ni okuduğunuzu kabul edersiniz.
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "space-between" }}>
            <Link href="/uye-ol" className="btn btnSecondary" style={{ whiteSpace: "nowrap" }}>
              Üye Ol
            </Link>
            <button type="submit" className="btn btnPrimary" disabled={loading || formInvalid}>
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </button>
          </div>
        </form>

        <hr style={{ margin: "1.5rem 0", opacity: 0.15 }} />

        <p className="small" style={{ lineHeight: 1.6 }}>
          Giriş yaparken sorun yaşıyorsanız,{" "}
          <Link href="/sifre-sifirla" className="underline">
            şifrenizi sıfırlayın
          </Link>{" "}
          veya{" "}
          <a href="mailto:info@durustev.com" className="underline">
            info@durustev.com
          </a>{" "}
          adresinden destek isteyin.
        </p>
      </div>
    </main>
  );
}
