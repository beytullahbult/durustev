// src/lib/moderation.ts
export type ModerationStatus = "pending" | "published" | "rejected";

/** Yeni yorumlar varsayılan olarak pending */
export function initialModerationStatus(): ModerationStatus {
  return "pending";
}

/** Kullanıcı doğrulamasını yorum göndermeden önce kontrol et */
export function canUserPostComment(user: { isVerified?: boolean; role?: "admin" | "user" }) {
  if ((user.role ?? "user") === "admin") return true; // admin esnek
  return !!user.isVerified; // normal kullanıcı doğrulanmalı
}

/** Basit PII süzgeci (opsiyonel) — çok agresif değil, yalnızca bariz örnekler */
export function stripObviousPII(text: string) {
  let t = text || "";
  // TC no benzeri 11 haneli sayılar
  t = t.replace(/\b\d{11}\b/g, "[kişisel veri]");
  // Telefon numarası basit kalıp
  t = t.replace(/\b(\+?90|0)?\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}\b/g, "[kişisel veri]");
  // E-posta
  t = t.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[kişisel veri]");
  return t;
}
