import Link from "next/link";

export default function HakkimizdaPage() {
  return (
    <main
      className="container"
      style={{
        background: "var(--cream, #faf7f2)",
        padding: "2rem 0",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "#fff",
          border: "1px solid rgba(0,0,0,.06)",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,.06)",
          padding: "2rem 1rem",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1
            style={{
              color: "var(--brand)",
              fontSize: "2.25rem",
              fontWeight: 800,
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Hakkımızda
          </h1>

          <p style={{ marginBottom: "1.5rem", lineHeight: 1.7, fontSize: "1.05rem" }}>
            <strong>Dürüstev</strong>, kullanıcıların kiracı, ev sahibi veya emlak profesyoneli olarak
            edindikleri deneyimleri paylaşabildiği <strong>bağımsız bir dijital platformdur.</strong>{" "}
            Platformun amacı, gayrimenkul süreçlerinde şeffaflığı artırmak, topluluk temelli
            bilgi paylaşımını teşvik etmek ve herkes için daha güvenilir bir karar alma zemini oluşturmaktır.
          </p>

          <h2
            style={{
              color: "var(--brand)",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: ".5rem",
            }}
          >
            Misyonumuz
          </h2>
          <p style={{ marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Ev kiralama ve satın alma süreçlerinde kullanıcıların yalnızca ilanlara değil,
            <strong> gerçek deneyimlere ve tarafsız yorumlara</strong> dayanarak karar verebilmesini sağlamak;
            kiracı–ev sahibi ilişkilerinde güveni ve saygıyı güçlendirmek.
          </p>

          <h2
            style={{
              color: "var(--brand)",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: ".5rem",
            }}
          >
            Vizyonumuz
          </h2>
          <p style={{ marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Türkiye’nin her ilinde, kullanıcıların gönül rahatlığıyla deneyimlerini paylaştığı,
            <strong> dürüst, saygılı ve toplumsal faydayı önceleyen</strong> bir topluluk oluşturmak.
          </p>

          <h2
            style={{
              color: "var(--brand)",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: ".5rem",
            }}
          >
            Değerlerimiz
          </h2>
          <ul style={{ marginBottom: "1.5rem", lineHeight: 1.7, paddingLeft: "1.25rem" }}>
            <li>
              <strong>Şeffaflık:</strong> Tüm kullanıcı yorumlarının açık biçimde erişilebilir olması.
            </li>
            <li>
              <strong>Güven:</strong> Yorumların doğruluk ve iyi niyet esasına dayanması.
            </li>
            <li>
              <strong>Tarafsızlık:</strong> Her görüşün eşit biçimde değerlendirilmesi.
            </li>
            <li>
              <strong>Topluluk:</strong> Kollektif katkıyla güvenilir bilgi üretimi.
            </li>
            <li>
              <strong>Kişisel Verilere Saygı:</strong> Tüm kullanıcı verileri{" "}
              <strong>KVKK (6698 sayılı Kişisel Verilerin Korunması Kanunu)</strong>{" "}
              hükümleri kapsamında korunur.
            </li>
          </ul>

          <h2
            style={{
              color: "var(--brand)",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: ".5rem",
            }}
          >
            Sorumluluk ve İçerik Politikası
          </h2>
          <p style={{ marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Dürüstev, kullanıcıların paylaştığı yorum ve içeriklerin doğruluğunu garanti etmez;
            ancak platformda yayımlanan içerikler
              Kullanım Şartları
            ve
              KVKK Aydınlatma Metni

            doğrultusunda düzenli olarak denetlenir. Yanıltıcı, kişisel veri içeren veya
            mevzuata aykırı içerikler gerektiğinde kaldırılır.
          </p>

          <h2
            style={{
              color: "var(--brand)",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: ".5rem",
            }}
          >
            İletişim
          </h2>
          <p style={{ lineHeight: 1.7 }}>
            Görüş, öneri veya işbirliği talepleriniz için bizimle{" "}
            <a href="mailto:info@durustev.com" className="underline">
              info@durustev.com
            </a>{" "}
            adresi üzerinden iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    </main>
  );
}