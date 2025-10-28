"use client";

import { useMemo, useState, useTransition } from "react";

type Review = {
  id: string;
  addressId: string;
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt?: string;
  address?: { display?: string; city?: string; district?: string };
  userName?: string;
  deleted?: boolean;
};

export default function ReviewsClient({ initialItems }: { initialItems: Review[] }) {
  const [items, setItems] = useState<Review[]>(initialItems || []);
  const [q, setQ] = useState("");
  const [isPending] = useTransition();

  const filtered = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr-TR");
    if (!term) return items;
    return items.filter((r) => {
      const hay = [
        r.address?.display,
        r.address?.city,
        r.address?.district,
        r.addressId,
        r.comment,
        r.userName,
      ]
        .filter(Boolean)
        .map((s) => String(s).toLocaleLowerCase("tr-TR"))
        .join(" ");
      return hay.includes(term);
    });
  }, [items, q]);

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 8, alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Yorum, adres, kullanıcı, şehir ara…"
          className="input"
          style={{ minWidth: 260 }}
        />
        {isPending && <span className="small muted">Güncelleniyor…</span>}
      </div>

      <div className="col" style={{ gap: 8 }}>
        {filtered.length === 0 ? (
          <p className="muted">Kayıt bulunamadı.</p>
        ) : (
          filtered.map((r) => {
            const cityUpper = (r.address?.city ||
              r.addressId?.split("::")?.[0]?.split("-")?.[0] ||
              "BİLİNMİYOR"
            ).toLocaleUpperCase("tr-TR");

            return (
              <div key={r.id} className="card">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div className="col" style={{ gap: 6, flex: 1 }}>
                    <div className="small muted">
                      <strong style={{ color: "var(--brand)" }}>{cityUpper}</strong>
                      {" · "}
                      <span>{r.address?.display || r.addressId}</span>
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{r.comment}</div>
                    <div className="small muted">
                      Puan: <strong>{r.rating}</strong>
                      {" · "}
                      Kullanıcı: {r.userName || "-"}
                      {" · "}
                      Tarih: {new Date(r.createdAt).toLocaleString("tr-TR")}
                      {r.updatedAt ? ` · Güncellendi: ${new Date(r.updatedAt).toLocaleString("tr-TR")}` : ""}
                      {r.deleted ? " · (SİLİNMİŞ)" : ""}
                    </div>
                  </div>
                  <div className="col" style={{ gap: 6, minWidth: 140, alignItems: "flex-end" }}>
                    {/* Butonları sonra ekleyeceğiz; şu an amaç import hatasını netlemek */}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
