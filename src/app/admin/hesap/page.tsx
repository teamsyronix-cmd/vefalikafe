import { redirect } from "next/navigation";
import { requireManager } from "@/lib/auth";

// "Kullanıcı Bilgileri" artık Ayarlar sayfasının (/admin/kullanicilar) en
// üstünde — eski bağlantılar bozulmasın diye buradan yönlendiriyoruz.
export default async function AdminAccountPage() {
  await requireManager();
  redirect("/admin/kullanicilar");
}
