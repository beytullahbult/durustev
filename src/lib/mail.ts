// src/lib/mail.ts
// Burada gerçek gönderim servisine bağlanmak yerine güvenli bir "adapter" yazıldı.
// İleride Resend/SendGrid anahtarın olunca bu fonksiyonun içinde entegre et.
type SendParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

export async function sendMail({ to, subject, html, text, from }: SendParams) {
  // TODO: Resend / SendGrid ile değiştir.
  // Şimdilik sadece logla ki build kırılmasın:
  console.log("[MAIL] ->", { to, subject, from: from ?? "info@durustev.com" });
  // Hata fırlatmayalım ki kayıt/verify akışın yürüsün:
  return { ok: true as const };
}

export function buildVerifyEmailHTML(link: string) {
  return `
    <div style="font-family:Arial,sans-serif">
      <h2>Dürüstev — E-posta Doğrulama</h2>
      <p>Hesabını doğrulamak için aşağıdaki bağlantıya tıkla:</p>
      <p><a href="${link}" target="_blank" rel="noreferrer">${link}</a></p>
      <p>Bağlantı 24 saat geçerlidir.</p>
    </div>
  `;
}
