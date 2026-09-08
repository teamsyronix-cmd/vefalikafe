import { cookies } from "next/headers";
import { logActivity } from "./activity";

const COOKIE_NAME = "admin_flash";

export type Flash = {
  id: string;
  type: "success" | "error";
  message: string;
};

// Yalnızca Server Action içinden çağrılır — bir sonraki sayfa render'ında
// ToastListener'ın göstereceği kısa ömürlü bir bildirim bırakır.
export async function setFlash(type: Flash["type"], message: string) {
  const store = await cookies();
  const payload: Flash = { id: crypto.randomUUID(), type, message };
  store.set(COOKIE_NAME, JSON.stringify(payload), {
    path: "/",
    maxAge: 8,
  });
}

// Server Component render'ında okunur (yalnızca okuma, cookie'yi değiştirmez).
export async function getFlash(): Promise<Flash | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Flash;
  } catch {
    return null;
  }
}

// Bir Server Action'ın gövdesini çalıştırır; başarılıysa/başarısızsa uygun
// bildirimi bırakır. Hatayı yutar (kullanıcıya çirkin hata sayfası yerine
// kırmızı toast gösterilsin diye) ama sunucu logunda görünsün diye yazdırır.
// Başarılı işlem ayrıca panel işlem kaydına yazılır (`log` ile metni değiştir
// ya da `log: false` ile bu işlemi kayda alma).
export async function withFlash(
  fn: () => Promise<void>,
  successMessage: string,
  errorMessage = "Bir hata oluştu, tekrar deneyin.",
  options?: { log?: string | false },
) {
  try {
    await fn();
    await setFlash("success", successMessage);
    if (options?.log !== false) {
      await logActivity(options?.log ?? successMessage);
    }
  } catch (err) {
    console.error(err);
    await setFlash("error", errorMessage);
  }
}
