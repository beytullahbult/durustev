// src/lib/users-store.ts
import fs from "node:fs/promises";
import path from "node:path";

export type Role = "admin" | "user";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  role?: Role;
  isDisabled?: boolean;
  isVerified?: boolean;
  /** bcrypt hash veya geçici düz metin (geçiş dönemi) */
  password?: string;
  /** eski alan adın varsa destek için */
  hashedPassword?: string;

  // e-posta doğrulama için opsiyonel alanlar
  emailVerifyToken?: string;
  emailVerifyExp?: string; // ISO
};

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

export async function readUsers(): Promise<UserRow[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeUsers(list: UserRow[]) {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function findUserByEmail(email: string) {
  const emailNorm = email.trim().toLowerCase();
  const all = await readUsers();
  return all.find((u) => u.email?.toLowerCase() === emailNorm) || null;
}

export async function upsertUser(user: UserRow) {
  const all = await readUsers();
  const idx = all.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...user };
  } else {
    all.push(user);
  }
  await writeUsers(all);
  return user;
}
