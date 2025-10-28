"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type AddressItem = { id:string; city:string; district:string; display:string; avgRating:number; reviewCount:number };
type Review = { id:string; addressId:string; userName:string; rating:number; comment:string; stayStart?:string; stayEnd?:string; createdAt:string };

export default function AddressDetail() {
  const { slug } = useParams<{ slug:string }>();
  const [address, setAddress] = useState<AddressItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    let mounted = true;
    (async ()=>{
      try{
        const aRes = await fetch("/api/addresses",{cache:"no-store"});
        const addrs = await aRes.json() as AddressItem[];
        const a = addrs.find(x=>x.id===slug) || null;
        setAddress(a);
        if (a) {
          const rRes = await fetch(`/api/reviews?addressId=${a.id}`,{cache:"no-store"});
          const rs = await rRes.json() as Review[];
          setReviews(rs);
        }
      } finally { if (mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false; };
  }, [slug]);

  if (loading) return <main className="container"><div className="card">Yükleniyor…</div></main>;
  if (!address) return <main className="container"><div className="card">Adres bulunamadı.</div></main>;

  return (
    <main className="container">
      <div className="col" style={{marginBottom:16}}>
        <h1 className="sectionHead">{address.display}</h1>
        <div className="muted">{address.city} / {address.district} — Ortalama Puan: {address.avgRating} ({address.reviewCount} yorum)</div>
      </div>

      <div className="col" style={{gap:16}}>
        {reviews.length===0 ? (
          <div className="card">Bu adrese henüz yorum yapılmamış.</div>
        ) : (
          reviews.map(r=>(
            <div key={r.id} className="card">
              <div className="row" style={{justifyContent:"space-between"}}>
                <div style={{fontWeight:600}}>{r.userName}</div>
                <div className="small">Puan: {r.rating}</div>
              </div>
              <p className="muted" style={{whiteSpace:"pre-line",marginTop:8}}>{r.comment}</p>
              {(r.stayStart || r.stayEnd) && (
                <div className="small" style={{marginTop:6}}>Kaldığı dönem: {r.stayStart || "?"} — {r.stayEnd || "?"}</div>
              )}
              <div className="small" style={{marginTop:4}}>Tarih: {new Date(r.createdAt).toLocaleDateString("tr-TR")}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
