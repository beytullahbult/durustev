"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TermsPage() {
  const searchParams = useSearchParams();

  // --- Geri dönüş adresini ilk render'da senkron hesaplayan yardım fonksiyonları ---
  const computeFromParam = () => {
    const v = searchParams.get("from");
    if (v === "giris") return "/giris";
    if (v === "uye-ol") return "/uye-ol";
    return null;
  };

  const computeFromReferrer = () => {
    try {
      if (typeof document === "undefined" || !document.referrer) return null;
      const ref = new URL(document.referrer, window.location.origin);
      const path = ref.pathname.replace(/\/+$/, "").toLowerCase();
      if (path.endsWith("/uye-ol") || path.includes("/uye-ol")) return "/uye-ol";
      if (path.endsWith("/giris") || path.includes("/giris")) return "/giris";
    } catch {}
    return null;
  };

  // 🟢 İlk değer senkron hesaplanır: parametre > referrer > /giris
  const initialBack =
    computeFromParam() ?? computeFromReferrer() ?? "/giris";

  const [backHref, setBackHref] = useState<string>(initialBack);

  // Parametre/referrer sonradan değişirse güncelle (çoğu durumda gerekmez ama güvenli)
  useEffect(() => {
    const fromP = computeFromParam();
    if (fromP && fromP !== backHref) {
      setBackHref(fromP);
      return;
    }
    const fromR = computeFromReferrer();
    if (fromR && fromR !== backHref) setBackHref(fromR);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔽 Buradan sonrası: İÇERİK AYNI (hiçbir metni değiştirmedim)
  return (
    <main className="container" style={{ padding: "2rem 0" }}>
      <div className="card" style={{ padding: "1.5rem" }}>
        <h1 className="sectionHead" style={{ color: "var(--brand)" }}>
          Dürüstev – Kullanım Koşulları
        </h1>

        <p className="small" style={{ marginTop: 8, lineHeight: 1.7 }}>
          <strong>Yürürlük Tarihi:</strong> 27 Ekim 2025
          <br />
          <strong>Alan adı:</strong> https://durustev.com
          <br />
          <strong>Hizmet sağlayıcı:</strong> Dürüstev Platformu (“Dürüstev”)
          <br />
          <strong>İletişim:</strong>{" "}
          <a href="mailto:info@durustev.com" className="underline">
            info@durustev.com
          </a>
        </p>

        {/* 1. Tanımlar ve Genel Hükümler */}
        <section style={{ marginTop: "1rem" }}>
          <h2>1. Tanımlar ve Genel Hükümler</h2>
          <p>
            Bu metin, Dürüstev’de sunulan hizmetlerin ve kullanıcıların
            Platformu kullanımının koşullarını düzenler. Platformu ziyaret eden
            ve/veya üye olan herkes bu koşulları kabul etmiş sayılır.
          </p>
          <ul style={{ marginLeft: "1rem", listStyle: "disc" }}>
            <li>
              <strong>Platform:</strong> Dürüstev’in internet sitesi ve ilgili
              dijital kanalları.
            </li>
            <li>
              <strong>Kullanıcı:</strong> Platforma erişen gerçek kişiler.
            </li>
            <li>
              <strong>Üye:</strong> Kayıt olup giriş yapan kullanıcı.
            </li>
            <li>
              <strong>Yorum:</strong> Üyelerin adres/ev sahibi/kiracı
              deneyimine ilişkin paylaşımları.
            </li>
          </ul>
        </section>

        {/* 2. Üyelik ve Hesap Kullanımı */}
        <section style={{ marginTop: "1rem" }}>
          <h2>2. Üyelik ve Hesap Kullanımı</h2>
          <ul style={{ marginLeft: "1rem", listStyle: "disc" }}>
            <li>Yorum yapabilmek için üyelik zorunludur. Üyelik ücretsizdir.</li>
            <li>
              Yorumlar <strong>herkese açık</strong> olarak görüntülenir.
            </li>
            <li>
              Üye, kayıt sırasında verdiği bilgilerin doğru ve güncel olduğunu
              beyan eder; hesabını üçüncü kişilerle paylaşamaz.
            </li>
            <li>
              Dürüstev, güvenlik ve mevzuat gerekleri kapsamında üyeliği
              askıya alma/sonlandırma hakkını saklı tutar.
            </li>
          </ul>
        </section>

        {/* 3. İçerik Üretimi (Yorumlar) */}
        <section style={{ marginTop: "1rem" }}>
          <h2>3. İçerik Üretimi (Yorumlar)</h2>
          <ul style={{ marginLeft: "1rem", listStyle: "disc" }}>
            <li>
              Platformdaki içerikler kullanıcılar tarafından üretilir; her
              kullanıcı paylaştığı içerikten hukuken sorumludur.
            </li>
            <li>
              Yorumların kişisel deneyime dayanması ve <strong>gerçek kişi
              verisi</strong> (ad-soyad, telefon, T.C. kimlik no, açık tam
              adres vb.) ifşa etmemesi gerekir.
            </li>
            <li>
              Dürüstev ön moderasyon uygulayabilir; bildirilen içerikleri
              inceler ve uygun görmediği içerikleri kaldırabilir/engelleyebilir.
            </li>
          </ul>
        </section>

        {/* 4. Kullanıcı Yükümlülükleri ve Yasaklar */}
        <section style={{ marginTop: "1rem" }}>
          <h2>4. Kullanıcı Yükümlülükleri ve Yasaklar</h2>
          <ul style={{ marginLeft: "1rem", listStyle: "disc" }}>
            <li>
              Hakaret, iftira, nefret söylemi, şiddet ve ayrımcılık içeren
              içerikler yasaktır.
            </li>
            <li>
              Üçüncü kişilerin kişilik hakları, özel hayatı ve ticari itibarını
              ihlal eden içerikler yasaktır.
            </li>
            <li>
              Spam, reklam, siyasi propaganda veya Platform’un kötüye kullanımı
              yasaktır.
            </li>
            <li>
              Kullanıcı; 5651 sayılı Kanun, TCK ve ilgili mevzuata uygun
              davranmayı kabul eder.
            </li>
          </ul>
        </section>

        {/* 5. Dürüstev’in Hakları ve Yetkileri */}
        <section style={{ marginTop: "1rem" }}>
          <h2>5. Dürüstev’in Hakları ve Yetkileri</h2>
          <ul style={{ marginLeft: "1rem", listStyle: "disc" }}>
            <li>
              Dürüstev, yer sağlayıcı konumunda olup kullanıcı içeriklerinin
              doğruluğunu taahhüt etmez.
            </li>
            <li>
              Bildirim veya resen tespit üzerine içerikleri kaldırma, erişimi
              engelleme ve hesapları kısıtlama/sonlandırma yetkisine sahiptir.
            </li>
            <li>
              Platform tasarımına, yazılımına ve veritabanına ilişkin tüm
              fikri ve sınai haklar Dürüstev’e aittir.
            </li>
          </ul>
        </section>

        {/* 6. Kişisel Verilerin Korunması ve Gizlilik */}
        <section style={{ marginTop: "1rem" }}>
          <h2>6. Kişisel Verilerin Korunması ve Gizlilik</h2>
          <p>
            Kullanıcı verileri 6698 sayılı KVKK kapsamında işlenir. Detaylar
            için{" "}
            <Link href="/kvkk" className="underline">
              KVKK Aydınlatma Metni
            </Link>{" "}
            ve{" "}
            <Link href="/gizlilik" className="underline">
              Gizlilik Politikası
            </Link>{" "}
            geçerlidir.
          </p>
        </section>

        {/* 7. Sorumluluk Reddi ve Hukuki Bildirimler */}
        <section style={{ marginTop: "1rem" }}>
          <h2>7. Sorumluluk Reddi ve Hukuki Bildirimler</h2>
          <ul style={{ marginLeft: "1rem", listStyle: "disc" }}>
            <li>
              Dürüstev, kullanıcılarca paylaşılan içeriklerden sorumlu değildir
              ve barınma kararları için herhangi bir taahhütte bulunmaz.
            </li>
            <li>
              Teknik bakım, güvenlik veya mücbir sebeplerle hizmete erişim
              geçici olarak kesilebilir.
            </li>
          </ul>
          <p style={{ marginTop: ".5rem" }}>
            Hukuki bildirim/iletişim:{" "}
            <a href="mailto:info@durustev.com" className="underline">
              info@durustev.com
            </a>
          </p>
        </section>

        {/* 8. Değişiklikler, Fesih ve Yürürlük */}
        <section style={{ marginTop: "1rem" }}>
          <h2>8. Değişiklikler, Fesih ve Yürürlük</h2>
          <p>
            Dürüstev, bu metni dilediğinde güncelleyebilir. Güncellenmiş metin
            Platformda yayımlandığı anda yürürlüğe girer. Platformun kullanılmaya
            devam edilmesi güncel koşulların kabulü anlamına gelir.
          </p>
        </section>

        <div style={{ marginTop: "2rem" }}>
          {/* KVKK ile aynı: sadece href ile yönlendirme */}
          <Link href={backHref} className="btn btnSecondary">
            Geri Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
