// src/lib/verify-utils.ts
import crypto from "node:crypto";
import { upsertUser, findUserByEmail, readUsers, writeUsers } from "./users-store";

export async function createEmailVerifyToken(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Kullanıcı bulunamadı");

  const token = crypto.randomUUID().replace(/-/g, "");
  const exp = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 saat

  await upsertUser({
    ...user,
    emailVerifyToken: token,
    emailVerifyExp: exp.toISOString(),
  });

  return { token, exp };
}

export async function verifyEmailToken(token: string) {
  const all = await readUsers();
  const now = Date.now();
  const i = all.findIndex(
    (u) =>
      u.emailVerifyToken === token &&
      u.emailVerifyExp &&
      new Date(u.emailVerifyExp).getTime() > now
  );

  if (i === -1) return { ok: false as const, error: "Token geçersiz veya süresi dolmuş." };

  all[i].isVerified = true;
  delete all[i].emailVerifyToken;
  delete all[i].emailVerifyExp;
  await writeUsers(all);

  return { ok: true as const, user: all[i] };
}
