"use client";

import { useEffect, useState } from "react";

type User = { id: string; email: string; name: string; isAdmin: boolean; banned: boolean; createdAt?: string };

export default function AdminUsersPage() {
  const [list, setList] = useState<User[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const r = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (r.ok) setList(await r.json());
  }
  useEffect(() => { load(); }, []); // ilk yükleme

  return (
    <main className="container" style={{ padding: "2rem 1rem" }}>
      <div className="card" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 className="sectionHead" style={{ color: "var(--brand)" }}>Kullanıcılar</h1>

        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <input className="input" placeholder="Ara (ad/e-posta)" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn" onClick={load}>Ara</button>
        </div>

        <div className="col" style={{ gap: 8 }}>
          {list.map(u => (
            <div key={u.id} className="card row" style={{ justifyContent: "space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div className="small muted">{u.email}</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                {u.isAdmin && <span className="small" style={{ color: "var(--brand)" }}>Admin</span>}
                {u.banned ? (
                  <button className="btn" onClick={async ()=>{
                    await fetch(`/api/admin/users/${u.id}/unban`, { method:"POST" });
                    load();
                  }}>Banı Kaldır</button>
                ) : (
                  <button className="btn" onClick={async ()=>{
                    await fetch(`/api/admin/users/${u.id}/ban`, { method:"POST" });
                    load();
                  }}>Banla</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
