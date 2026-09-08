import { isOwner, requireAdmin } from "@/lib/auth";
import { getCustomers } from "@/lib/orders-data";
import CustomerManager from "@/components/admin/CustomerManager";
import BackupImportButton from "@/components/admin/BackupImportButton";
import { importCustomersAction } from "../actions";

export const dynamic = "force-dynamic";

// Garson için: kullanıcı adının ilk 3 karakteri + "@alan.com" görünür, arası
// sansürlü (ör. eli•••••@gmail.com). Maskeleme sunucuda yapılır — garsonun
// tarayıcısına tam e-posta hiç gitmez.
function maskEmail(email: string): string {
  if (!email) return "";
  const at = email.lastIndexOf("@");
  if (at <= 0) {
    return email.slice(0, 3) + "•".repeat(Math.max(3, email.length - 3));
  }
  const local = email.slice(0, at);
  const domain = email.slice(at); // "@gmail.com"
  const visible = local.slice(0, 3);
  const hidden = "•".repeat(Math.max(3, local.length - 3));
  return visible + hidden + domain;
}

export default async function CustomersPage() {
  const session = await requireAdmin();
  const canEdit = session.role === "mudur";
  const owner = isOwner(session);
  const customers = await getCustomers();
  const shown = canEdit
    ? customers
    : customers.map((c) => ({ ...c, email: maskEmail(c.email) }));

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-heading text-2xl font-extrabold text-ink">👥 Müşteriler</p>
          <p className="text-[13px] font-semibold text-muted">
            {customers.length} kayıtlı müşteri
          </p>
        </div>

        {owner && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {/* Route handler (CSV indirme) — sayfa değil, bu yüzden düz <a download>. */}
            <a
              href="/admin/musteriler/yedek"
              download
              className="flex items-center gap-1.5 rounded-full bg-chip px-4 py-2 text-[13px] font-bold text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Yedek Al (CSV)
            </a>
            <BackupImportButton
              action={importCustomersAction}
              accept=".csv,text/csv"
              label="İçe Aktar"
              confirmMessage="Seçtiğin CSV'deki kayıtlar, panelde zaten var olan müşterilerin ad/yıldız bilgilerini günceller. Devam edilsin mi?"
            />
          </div>
        )}
      </div>

      <CustomerManager customers={shown} canEdit={canEdit} />
    </div>
  );
}
