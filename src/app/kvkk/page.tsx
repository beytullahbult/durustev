"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function KvkkPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const backHref =
    from === "giris" ? "/giris" : from === "uye-ol" ? "/uye-ol" : "/";

  return (
    <main className="container" style={{ padding: "2rem 0" }}>
      <div className="card" style={{ padding: "1.5rem" }}>
        <h1 className="sectionHead" style={{ color: "var(--brand)" }}>
          KVKK Aydınlatma Metni ve Açık Rıza Beyanı
        </h1>

        <p className="small" style={{ marginTop: 8, lineHeight: 1.7 }}>
          <strong>Yürürlük Tarihi:</strong> 27 Ekim 2025
          <br />
          <strong>Veri Sorumlusu:</strong> Dürüstev Platformu
          <br />
          <strong>Alan adı:</strong> https://durustev.com
          <br />
          <strong>İletişim:</strong>{" "}
          <a className="underline" href="mailto:info@durustev.com">
            info@durustev.com
          </a>
        </p>

        {/* 1. Veri Sorumlusu ve Kapsam */}
        <section style={{ marginTop: "1rem" }}>
          <h2>1. Veri Sorumlusu ve Kapsam</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca
            kişisel verileriniz; Dürüstev Platformu tarafından, bu metinde
            belirtilen amaçlar ve hukuki sebepler çerçevesinde; platformun
            işletilmesi, üyelik ve yorum süreçlerinin yürütülmesi ve
            mevzuattan doğan yükümlülüklerin yerine getirilmesi için
            işlenmektedir.
          </p>
        </section>

        {/* 2. İşlenen Kişisel Veri Kategorileri */}
        <section style={{ marginTop: "1rem" }}>
          <h2>2. İşlenen Kişisel Veri Kategorileri</h2>
          <ul>
            <li>Kimlik: Ad, soyad (isteğe bağlı ya da takma ad/rumuz)</li>
            <li>İletişim: E-posta adresi (doğrulama, bildirim, talep yanıtı)</li>
            <li>
              İşlem Güvenliği: IP adresi, tarayıcı bilgisi, oturum/log kayıtları
            </li>
            <li>
              Kullanım/İçerik: Platform üzerindeki yorumlar, puanlamalar, tarih/saat
            </li>
            <li>Çerez Verileri: Ziyaret istatistikleri ve performans ölçümleri</li>
          </ul>
          <p className="small" style={{ marginTop: 6 }}>
            Not: Yorumlarda <strong>kişisel veri ifşası</strong> (ad-soyad, telefon,
            T.C. kimlik no, açık adres vb.) yapılmaması kullanıcı sorumluluğundadır.
          </p>
        </section>

        {/* 3. Amaçlar ve Hukuki Sebepler */}
        <section style={{ marginTop: "1rem" }}>
          <h2>3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepler</h2>
          <ul>
            <li>
              Üyelik oluşturma, giriş/doğrulama, hesap yönetimi
              <em> — KVKK m.5/2 (c), (ç), (f)</em>
            </li>
            <li>
              Yorumların üye hesaplarıyla ilişkilendirilmesi, suistimalin önlenmesi
              <em> — KVKK m.5/2 (f)</em>
            </li>
            <li>
              Güvenlik, hata ayıklama, performans ve hizmet geliştirme
              <em> — KVKK m.5/2 (f)</em>
            </li>
            <li>
              Mevzuat kaynaklı taleplere ve resmî kurum yazılarına cevap verilmesi
              <em> — KVKK m.5/2 (ç)</em>
            </li>
            <li>
              Bilgilendirme/duyuru e-postaları (tercihe bağlı)
              <em> — KVKK m.5/1 (açık rıza)</em>
            </li>
          </ul>
        </section>

        {/* 4. Toplama Yöntemi ve Saklama Süresi */}
        <section style={{ marginTop: "1rem" }}>
          <h2>4. Toplama Yöntemi ve Saklama Süresi</h2>
          <p>
            Veriler; üyelik formları, kullanıcı paneli, çerezler ve log
            kayıtları üzerinden elektronik ortamda elde edilir. Yasal
            yükümlülükler ve meşru menfaatler gereği veriler ilgili mevzuata
            uygun sürelerle; hesap faaliyet kayıtları en fazla{" "}
            <strong>5 yıl</strong>, teknik loglar en fazla{" "}
            <strong>2 yıl</strong> saklanır. Hesap silme talebinde, mevzuattan
            doğan saklama yükümlülükleri saklı kalmak kaydıyla veriler silinir,
            yok edilir veya anonimleştirilir.
          </p>
        </section>

        {/* 5. Aktarım ve Yurt Dışı Aktarım */}
        <section style={{ marginTop: "1rem" }}>
          <h2>5. Veri Aktarımı ve Yurt Dışı Aktarım</h2>
          <ul>
            <li>
              Veriler <strong>Türkiye</strong> içinde barındırılır; güvenlik,
              erişim ve teknik destek amaçlı sınırlı ölçüde tedarikçilerle
              paylaşılabilir.
            </li>
            <li>
              Sadece e-posta gönderimi hizmeti için (örn. toplu bildirim servisleri)
              <strong> açık rızanız alınarak</strong> yurt dışına aktarım
              yapılabilir.
            </li>
            <li>Hiçbir kullanıcı verisi üçüncü kişilere <strong>satılmaz</strong>.</li>
          </ul>
        </section>

        {/* 6. Çerezler ve Benzer Teknolojiler */}
        <section style={{ marginTop: "1rem" }}>
          <h2>6. Çerezler ve Benzer Teknolojiler</h2>
          <p>
            Platform; oturum yönetimi, performans ve istatistik amacıyla çerezler
            kullanır. Detaylı bilgi için{" "}
            <Link href="/gizlilik" className="underline">
              Gizlilik/Çerez Politikası
            </Link>{" "}
            sayfasını inceleyebilirsiniz.
          </p>
        </section>

        {/* 7. İlgili Kişi Hakları (KVKK m.11) */}
        <section style={{ marginTop: "1rem" }}>
          <h2>7. İlgili Kişi (Kullanıcı) Hakları — KVKK m.11</h2>
          <ul>
            <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>Amacına uygun işlenip işlenmediğini öğrenme</li>
            <li>Aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Silme, yok etme veya anonimleştirme talep etme</li>
            <li>Yapılan işlemlerin üçüncü kişilere bildirilmesini isteme</li>
            <li>Otomatik analiz sonucu aleyhe bir sonuca itiraz etme</li>
            <li>Zarara uğraması halinde tazminat talep etme</li>
          </ul>
        </section>

        {/* 8. Başvuru Usulü */}
        <section style={{ marginTop: "1rem" }}>
          <h2>8. Başvuru Usulü</h2>
          <p>
            KVKK kapsamındaki taleplerinizi{" "}
            <a className="underline" href="mailto:info@durustev.com">
              info@durustev.com
            </a>{" "}
            adresine <strong>“KVKK Başvuru”</strong> konu başlığıyla iletebilirsiniz.
            Başvurularınız, mevzuata uygun olarak <strong>30 gün</strong> içinde
            ücretsiz şekilde sonuçlandırılır.
          </p>
        </section>

        {/* 9. Açık Rıza Beyanı */}
        <section style={{ marginTop: "1rem" }}>
          <h2>9. Açık Rıza Beyanı</h2>
          <p>
            Dürüstev’e kayıt/üye olarak; e-posta adresinizin doğrulama ve
            bildirim amaçlı kullanılmasına, yorumlarınızın gerekli hallerde
            <strong> anonimleştirilerek</strong> istatistiksel analizlerde
            kullanılmasına ve sadece tercih etmeniz halinde, e-posta hizmet
            sağlayıcısına <strong>yurt dışına aktarım</strong> yapılmasına açık
            rıza göstermiş olursunuz. Açık rızanızı dilediğiniz zaman geri
            çekebilirsiniz.
          </p>
        </section>

        {/* 10. Güncellemeler */}
        <section style={{ marginTop: "1rem" }}>
          <h2>10. Güncellemeler</h2>
          <p>
            Bu metin, mevzuat değişiklikleri ve hizmet ihtiyaçlarına paralel
            olarak güncellenebilir. Güncel sürüm her zaman{" "}
            <Link href="/kvkk" className="underline">
              /kvkk
            </Link>{" "}
            adresinde yayımlanır. İlgili sözleşme metinleri için{" "}
            <Link href="/kullanim-kosullari" className="underline">
              /kullanim-kosullari
            </Link>{" "}
            sayfasını ziyaret edebilirsiniz.
          </p>
        </section>

        <div style={{ marginTop: "2rem" }}>
          <Link href={backHref} className="btn btnSecondary">
            Geri Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
