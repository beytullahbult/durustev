import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/check-admin";
import { readUsers, writeUsers } from "@/lib/users-store";

type Params = { params: { id: string } };

export async function POST(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const users = await readUsers();
    const u = users.find(x => x.id === params.id);
    if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });
    u.banned = true;
    await writeUsers(users);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
