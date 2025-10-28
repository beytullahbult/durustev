"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterPayload = {
  email: string;
  password: string;
  nickname?: string;
  isAnonymous: boolean; // sunucuya anonim olarak gittiğimizden emin olmak için
  acceptTerms: boolean;
};

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState(""); // rumuz / görünen ad (opsiyonel)
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit =
    email.trim() !== "" &&
    password.length >= 6 &&
    password === passwordAgain &&
    acceptTerms &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!canSubmit) return;

    try {
      setLoading(true);

      const payload: RegisterPayload = {
        email: email.trim(),
        password,
        nickname: nickname.trim() || undefined,
        isAnonymous: true, // ✅ anonim kutusu yok, backend'e her zaman anonim gitsin
        acceptTerms: true,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
  let j: any = null;
  try { j = await res.json(); } catch {}
  const msg = j?.error || j?.message || `Kayıt başarısız (${res.status}).`;
  throw new Error(msg);
}

      // Başarılı kayıt → giriş sayfasına yönlendir, e-maili önceden doldurmak istersen query ile taşıyabilirsin
      router.push("/giris");
    } catch (e: any) {
      setErr(e?.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: 520, padding: "2rem 0" }}>
      <div className="card" style={{ padding: "1.5rem" }}>
        <h1 className="sectionHead" style={{ color: "var(--brand)" }}>
          Üye Ol
        </h1>

        <p className="small" style={{ marginTop: 8 }}>
          Dürüstev’de <strong>yorumlar herkese açık</strong> olarak görüntülenir.
          Üyelik zorunludur. Profilinizde <strong>ad soyad</strong> (takma ad)
          kullanabilirsiniz; gerçek adınız yayımlanmaz.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
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

          <div style={{ height: 12 }} />

          <label className="label">
            Ad Soyad
            <span className="small" style={{ opacity: 0.8 }}>
              {" "}
              — Profilde görünecek ad
            </span>
          </label>
          <input
            className="input"
            type="text"
            placeholder="ör. DürüstKullanıcı"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={40}
          />

          <div style={{ height: 12 }} />

          <label className="label">Parola</label>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="En az 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <div style={{ height: 12 }} />

          <label className="label">Parola (Tekrar)</label>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="Parolanızı tekrar girin"
            value={passwordAgain}
            onChange={(e) => setPasswordAgain(e.target.value)}
            required
            minLength={6}
          />

          {/* ❌ "Anonim olsun" tiki ve yazısı kaldırıldı */}

          <div style={{ height: 12 }} />

          <label className="checkbox" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            <span className="small">
              <strong>Kullanım Koşulları</strong> ve <strong>KVKK</strong> metnini okudum ve kabul ediyorum.{" "}
              <Link className="underline" href="/kullanim-sartlari?from=uye-ol">
                Kullanım Koşulları
              </Link>{" "}
              ·{" "}
              <Link className="underline" href="/kvkk?from=uye-ol">
                KVKK Aydınlatma Metni
              </Link>
            </span>
          </label>

          {err && (
            <p className="small" style={{ color: "crimson", marginTop: 8 }}>
              {err}
            </p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              type="submit"
              className="btn btnPrimary"
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
            >
              {loading ? "Kaydediliyor..." : "Üye Ol"}
            </button>
            <Link href="/giris" className="btn btnSecondary">
              Zaten hesabım var
            </Link>
          </div>
        </form>

        <hr style={{ margin: "1.5rem 0", opacity: 0.15 }} />

        <p className="small" style={{ lineHeight: 1.6 }}>
          Kayıt olarak; kullanıcı yorumlarının doğruluğundan bizzat sorumlu olduğunuzu, hakaret/iftira ve kişisel veri
          paylaşımının yasak olduğunu, bildirilen içeriklerin kaldırılabileceğini ve hizmet koşullarının geçerli olduğunu
          kabul etmiş olursunuz.
        </p>
      </div>
    </main>
  );
}
