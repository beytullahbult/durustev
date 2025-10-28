// src/app/profil/page.tsx
import { promises as fs } from "node:fs";
import path from "node:path";
import ProfileClient from "./profile-client";
import { getSessionUser } from "@/lib/auth";

export type Review = {
  id: string;
  addressId: string;
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt?: string;
  address?: { display?: string; city?: string; district?: string };
  userName?: string;
  author?: { id?: string; email?: string; name?: string | null };
};

export default async function ProfilPage() {
  // ✅ Sunucu tarafında HttpOnly cookie’den oturum al
  const me = await getSessionUser();

  if (!me) {
    return (
      <main className="container" style={{ padding: "2rem 1rem" }}>
        <div className="card" style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Profilim</h1>
          <p className="muted">
            Bu sayfayı görmek için lütfen <a className="link" href="/giris">giriş yapın</a>.
          </p>
        </div>
      </main>
    );
  }

  // reviews.json oku
  const DATA_DIR = path.join(process.cwd(), "data");
  const REVIEWS_PATH = path.join(DATA_DIR, "reviews.json");
  let reviews: Review[] = [];
  try {
    const buf = await fs.readFile(REVIEWS_PATH, "utf8");
    const arr = JSON.parse(buf);
    if (Array.isArray(arr)) reviews = arr;
  } catch {
    // dosya yoksa boş liste
  }

  // Sadece kullanıcının yorumları
  const mine = reviews
    .filter((r) => {
      // Yeni JWT şemasında id => me.sub
      if (r.author?.id && r.author.id === me.sub) return true;

      // Eski kayıtlarda id yoksa ad üzerinden eşle (opsiyonel)
      if (!r.author?.id && r.userName && me.name) {
        return r.userName.trim().toLocaleLowerCase("tr-TR") === String(me.name).trim().toLocaleLowerCase("tr-TR");
      }
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <main className="container" style={{ padding: "2rem 1rem" }}>
      <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Profilim</h1>
        </div>

        {/* Doğrulama uyarısı: admin muaf */}
        {me.isVerified === false && me.role !== "admin" && (
          <div
            className="card"
            style={{
              marginTop: 12,
              borderColor: "rgba(0,0,0,.06)",
              background: "color-mix(in oklab, var(--brand) 6%, var(--cream, #fbf8f3))",
            }}
          >
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <strong style={{ color: "var(--brand)" }}>E-postanız doğrulanmadı</strong>
                <p className="small" style={{ marginTop: 6, opacity: .8 }}>
                  Üst menüdeki uyarıdan <em>“Yeniden Gönder”</em> butonunu kullanabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="col" style={{ gap: 8, marginTop: 12 }}>
          <div><strong>Ad:</strong> {me.name || "(–)"}</div>
          <div><strong>E-posta:</strong> {me.email}</div>
        </div>

        <hr style={{ margin: "16px 0", opacity: .15 }} />

        <h2 className="sectionHead" style={{ fontSize: 18, color: "var(--brand)" }}>Yorumlarım</h2>

        <ProfileClient
          initialReviews={mine}
          me={{ id: me.sub, email: me.email, name: me.name ?? "" }}
        />
      </div>
    </main>
  );
}
