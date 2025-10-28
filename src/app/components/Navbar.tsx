// src/app/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

// ✅ /api/auth/me tipi (GÜNCEL: { me } döner)
type UserMe = {
  id: string;            // ← önce uid idi; /api/auth/me { id } döndürüyor
  email: string;
  name?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
};
type MeResponse = { me: UserMe | null }; // ← önce { user } bekliyordu

function initialsOf(name?: string) {
  const parts = (name || "").trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase() || "U";
}

/* ------------------ EKLENEN YARDIMCI FONKSİYONLAR (DEĞİŞTİRME YOK) ------------------ */
function looksLikeJWT(value: string) {
  return typeof value === "string" && value.split(".").length === 3;
}
function b64urlToUtf8(b64url: string) {
  try {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return json;
  } catch {
    return "";
  }
}
function tryParseJWTFromCookies(): UserMe | null {
  try {
    const cookie = document.cookie || "";
    if (!cookie) return null;
    // Muhtemel anahtarlar + tüm cookie’lerde JWT’ye benzer değer ara
    const candidates: string[] = [];
    const pairs = cookie.split(/;\s*/);
    for (const p of pairs) {
      const eq = p.indexOf("=");
      if (eq === -1) continue;
      const val = p.slice(eq + 1);
      const clean = val.startsWith("Bearer ") ? val.slice(7) : val;
      if (looksLikeJWT(clean)) candidates.push(clean);
    }
    for (const token of candidates) {
      const parts = token.split(".");
      const payloadStr = b64urlToUtf8(parts[1] || "");
      if (!payloadStr) continue;
      const payload = JSON.parse(payloadStr);
      if (!payload || !payload.uid || !payload.email) continue;
      const me: UserMe = {
        id: String(payload.uid),
        email: String(payload.email),
        name: payload.name ?? undefined,
        isAdmin: !!payload.isAdmin,
        isVerified:
          payload.isVerified === undefined ? true : !!payload.isVerified,
      };
      return me;
    }
    return null;
  } catch {
    return null;
  }
}
/* ------------------------------------------------------------------------------------ */

export default function Navbar() {
  // me: undefined => loading, null => anonim, object => oturum açık
  const [me, setMe] = useState<UserMe | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [bannerClosed, setBannerClosed] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [resendMsg, setResendMsg] = useState<string>("");

  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  async function loadMe() {
    try {
      const r = await fetch(`/api/auth/me?ts=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          "cache-control": "no-store",
          pragma: "no-cache",
        },
      });
      const data: MeResponse = await r.json();
      if (data?.me) {
        setMe(data.me);
        return;
      }
      // /api/auth/me me:null ise Yedek Plan: Çerezden JWT’yi çöz ve me üret
      const fromCookie = tryParseJWTFromCookies();
      setMe(fromCookie ?? null);
    } catch {
      // Ağ hatası vb. durumda da çerezden dene
      const fromCookie = tryParseJWTFromCookies();
      setMe(fromCookie ?? null);
    }
  }

  useEffect(() => {
    loadMe();
    const onFocus = () => {
      if (document.visibilityState === "visible") loadMe();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  useEffect(() => {
    loadMe();
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // 🔔 Banner yalnızca: giriş yapılmış + e-posta doğrulanmamış + **admin değil** + / veya /profil
  const shouldShowBanner =
    !!me &&
    me.isVerified === false &&
    !me.isAdmin &&
    !bannerClosed &&
    (pathname === "/" || pathname.startsWith("/profil"));

  const brandVars = {
    ["--brand" as any]: "#204A6B",
    ["--brand-dark" as any]: "#1B3E5A",
    ["--brand-light" as any]: "#24557B",
  };

  async function resendVerification() {
    if (!me?.email) return;
    setResendState("loading");
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: me.email }),
      });
      const j = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setResendState("error");
        setResendMsg(j?.error || "Tekrar gönderilemedi.");
        return;
      }
      setResendState("sent");
      setResendMsg(j?.message || "Doğrulama e-postası gönderildi.");
    } catch {
      setResendState("error");
      setResendMsg("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
  }

  return (
    <header className={styles.header} style={brandVars}>
      <nav className={styles.nav}>
        <div className={styles.colLeft}>
          <Link href="/" className={styles.brand} aria-label="dürüstev ana sayfa">
            <Image src="/logo.png" alt="dürüstev logo" width={84} height={84} priority />
            <span className={styles.brandText}>dürüstev</span>
          </Link>
        </div>

        <div className={styles.colCenter}>
          <div className={styles.menu}>
            <Link href="/adres/ekle">Adrese Yorum Ekle</Link>
            <Link href="/hakkimizda">Hakkımızda</Link>
          </div>
        </div>

        <div className={styles.colRight}>
          {/* Loading iskelet (flicker önler) */}
          {me === undefined && (
            <>
              <div className="h-9 w-20 rounded-lg bg-ink/10" />
              <div className="h-9 w-24 rounded-lg bg-ink/10" />
            </>
          )}

          {/* Oturum açık */}
          {me && me !== undefined && (
            <div className={styles.userMenu} ref={menuRef}>
              <button
                onClick={() => setOpen((s) => !s)}
                className={styles.userBtn}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Kullanıcı menüsü"
              >
                <span className={styles.userAvatar}>{initialsOf(me.name)}</span>
                <span className={styles.userMeta}>
                  <span className={styles.userName}>{me.name || me.email}</span>
                  <span className={styles.roleBadge}>
                    <span className={styles.roleDot} aria-hidden />
                    {me.isAdmin ? "Admin" : "Kullanıcı"}
                  </span>
                </span>
                <svg
                  className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {open && (
                <div role="menu" className={styles.userDropdown}>
                  <div className={styles.userDropdownHeader}>
                    <p className={styles.userDropdownCaption}>Giriş yapıldı</p>
                    <p className={styles.userDropdownName}>{me.name || me.email}</p>
                  </div>

                  <Link href="/profil" role="menuitem" className={styles.userDropdownItem}>
                    Profilim
                  </Link>

                  {me.isAdmin && (
                    <Link href="/admin" role="menuitem" className={styles.userDropdownItem}>
                      Admin Paneli
                    </Link>
                  )}

                  <div className={styles.userDropdownDivider} />

                  <button
                    role="menuitem"
                    className={`${styles.userDropdownItem} ${styles.danger}`}
                    onClick={async () => {
                      try {
                        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                      } catch {}
                      setOpen(false);
                      setMe(null);
                      router.push("/");
                      router.refresh();
                    }}
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Oturum yok */}
          {me === null && (
            <>
              <Link href="/giris" className={styles.linkBtn}>Giriş Yap</Link>
              <Link href="/uye-ol" className={styles.signup}>Üye Ol</Link>
            </>
          )}
        </div>
      </nav>

      {/* Doğrulama Bannerı — adminler muaf */}
      {shouldShowBanner && (
        <div role="status" aria-live="polite" style={bannerWrap}>
          <div style={bannerInner}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong style={{ color: "var(--brand)" }}>E-postanız doğrulanmadı</strong>
              <span style={{ fontSize: 13, opacity: 0.8 }}>
                Lütfen e-posta kutunuzu kontrol edin veya doğrulama e-postasını yeniden gönderin.
              </span>
              {resendMsg && (
                <span
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: resendState === "error" ? "#c0382b" : "var(--brand)",
                  }}
                >
                  {resendMsg}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="btn"
                onClick={resendVerification}
                disabled={resendState === "loading"}
                style={bannerBtn}
              >
                {resendState === "loading" ? "Gönderiliyor…" : "Yeniden Gönder"}
              </button>
              <button
                aria-label="Uyarıyı kapat"
                onClick={() => setBannerClosed(true)}
                style={bannerClose}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---- inline banner stilleri ---- */
const bannerWrap: React.CSSProperties = {
  borderTop: "1px solid color-mix(in oklab, var(--ink) 10%, transparent)",
  background: "color-mix(in oklab, var(--brand) 6%, var(--cream))",
};
const bannerInner: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "10px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};
const bannerBtn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid color-mix(in oklab, var(--brand) 20%, transparent)",
  background: "var(--brand)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
const bannerClose: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,.08)",
  background: "transparent",
  color: "color-mix(in oklab, var(--ink) 75%, black)",
  cursor: "pointer",
};
