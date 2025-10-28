// src/lib/check-admin.ts
import { getSession } from "./get-session";

export async function requireAdmin() {
  const me = await getSession();
  if (!me || me.role !== "admin") {
    throw new Error("Bu işlem için yönetici yetkisi gerekir.");
  }
  return me;
}
