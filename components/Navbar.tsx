// components/Navbar.tsx
import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.header}>
      <nav className={`${styles.nav} container`}>
        {/* Sol: Logo + Yazı */}
        <Link href="/" className={styles.brand}>
          <Image src="/logo.png" alt="dürüstev" width={48} height={48} priority />
          <span className={styles.title}>dürüstev</span>
        </Link>

        {/* Orta: Menü */}
        <div className={styles.menu}>
          <Link href="/adres/ekle">Adres Ekle</Link>
          <Link href="/hakkimizda">Hakkımızda</Link>
        </div>

        {/* Sağ: Giriş / Üye Ol */}
        <div className={styles.right}>
          <Link href="/giris">Giriş Yap</Link>
          <Link href="/uye-ol" className={styles.signup}>Üye Ol</Link>
        </div>
      </nav>
    </header>
  );
}
