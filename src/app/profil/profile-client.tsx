"use client";

import { useMemo, useState } from "react";
import type { Review } from "@/types/review";

type Me = { id: string; email: string; name: string };

export default function ProfileClient({
  initialReviews,
  me,
}: {
  initialReviews: Review[];
  me: Me;
}) {
  const [items, setItems] = useState<Review[]>(initialReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ comment: string; rating: number }>({ comment: "", rating: 5 });
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const editingItem = useMemo(
    () => items.find((x) => x.id === editingId) || null,
    [items, editingId]
  );

  function openEdit(r: Review) {
    setEditingId(r.id);
    setForm({ comment: r.comment, rating: r.rating });
  }
  function closeEdit() {
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Silme başarısız");
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      alert("Yorum silinirken bir hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSave() {
    if (!editingId) return;
    const id = editingId;
    if (!form.comment.trim()) {
      alert("Yorum metni boş olamaz.");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      alert("Puan 1 ile 5 arasında olmalıdır.");
      return;
    }

    setLoadingId(id);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          comment: form.comment.trim(),
          rating: form.rating,
        }),
      });
      if (!res.ok) throw new Error("Güncelleme başarısız");

      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                comment: form.comment.trim(),
                rating: form.rating,
                updatedAt: new Date().toISOString(),
              }
            : x
        )
      );
      closeEdit();
    } catch {
      alert("Yorum güncellenirken bir hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  }

  if (items.length === 0) {
    return <p className="muted">Henüz bir yorum eklememişsiniz.</p>;
  }

  return (
    <div className="col" style={{ gap: 10 }}>
      {items.map((r) => {
        const isEditing = editingId === r.id;
        return (
          <div key={r.id} className="card" style={{ borderColor: "rgba(0,0,0,.06)" }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.address?.display || r.addressId}
              </div>
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <div className="small" style={{ opacity: .7 }}>
                  {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                  {r.updatedAt ? <span title={`Güncellendi: ${new Date(r.updatedAt).toLocaleString("tr-TR")}`}> · (düzenlendi)</span> : null}
                </div>
                {!isEditing && (
                  <>
                    <button
                      className="btn"
                      onClick={() => openEdit(r)}
                      disabled={loadingId === r.id}
                      style={btnGhost}
                      aria-label="Yorumu düzenle"
                    >
                      Düzenle
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleDelete(r.id)}
                      disabled={loadingId === r.id}
                      style={btnDangerGhost}
                      aria-label="Yorumu sil"
                    >
                      Sil
                    </button>
                  </>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="small" style={{ marginTop: 4 }}>
                Puan: <strong>{r.rating}</strong>
              </div>
            )}

            {!isEditing ? (
              <p style={{ marginTop: 8, lineHeight: 1.6 }}>{r.comment}</p>
            ) : (
              <div className="col" style={{ gap: 8, marginTop: 8 }}>
                <label className="small" htmlFor={`rating-${r.id}`} style={{ opacity: .8 }}>
                  Puan (1–5)
                </label>
                <input
                  id={`rating-${r.id}`}
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                  style={inputStyle}
                />
                <label className="small" htmlFor={`comment-${r.id}`} style={{ opacity: .8 }}>
                  Yorum
                </label>
                <textarea
                  id={`comment-${r.id}`}
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  rows={4}
                  style={textareaStyle}
                />
                <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
                  <button className="btn" onClick={closeEdit} disabled={loadingId === r.id} style={btnGhost}>
                    Vazgeç
                  </button>
                  <button className="btn" onClick={handleSave} disabled={loadingId === r.id} style={btnPrimary}>
                    Kaydet
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* inline stiller */
const btnGhost: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,.08)",
  background: "transparent",
  color: "var(--brand)",
  fontWeight: 600,
  cursor: "pointer",
};

const btnDangerGhost: React.CSSProperties = {
  ...btnGhost,
  color: "#c0382b",
  borderColor: "rgba(192,56,43,.25)",
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid color-mix(in oklab, var(--brand) 20%, transparent)",
  background: "var(--brand)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,.12)",
  borderRadius: 10,
  padding: "8px 10px",
  maxWidth: 120,
};

const textareaStyle: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,.12)",
  borderRadius: 10,
  padding: "8px 10px",
  width: "100%",
  resize: "vertical",
};
