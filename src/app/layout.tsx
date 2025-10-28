import "./globals.css";
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import Navbar from "./components/Navbar";

const rubik = Rubik({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dürüstev",
  description: "Adres bazlı kiracı yorumları",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={rubik.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
