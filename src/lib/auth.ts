import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "./supabase";

const COOKIE_NAME = "vefali_admin_session";
// Müdür: 10 dk hareketsizlikte oturum kapanır (güvenlik).
// Garson: tüm gün açık kalabilsin diye çok daha uzun — sekme açık kaldıkça
// istemci tarafı periyodik tazeleme ile süre hep ileri kayar.
const MANAGER_TTL_MS = 1000 * 60 * 10;
const WAITER_TTL_MS = 1000 * 60 * 60 * 18;

export type PanelRole = "mudur" | "garson";
export type PanelSession = { actor: string; role: PanelRole };

function ttlFor(role: PanelRole): number {
  return role === "garson" ? WAITER_TTL_MS : MANAGER_TTL_MS;
}

function sign(value: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET tanımlı değil");
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// ---------- Şifre hash'leme (Node scrypt — ek bağımlılık yok) ----------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  try {
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    const derived = crypto.scryptSync(password, salt, expected.length);
    return (
      expected.length === derived.length && crypto.timingSafeEqual(expected, derived)
    );
  } catch {
    return false;
  }
}

// ---------- Kimlik doğrulama ----------

// Önce ortam değişkenindeki sabit sahip girişi, sonra panel_users tablosu.
export async function verifyAdminCredentials(
  id: string,
  password: string,
): Promise<PanelSession | null> {
  const envId = process.env.ADMIN_ID;
  const envPw = process.env.ADMIN_PASSWORD;
  if (
    envId &&
    envPw &&
    timingSafeStringEqual(id, envId) &&
    timingSafeStringEqual(password, envPw)
  ) {
    return { actor: envId, role: "mudur" };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("panel_users")
      .select("username, password_hash, role, active")
      .eq("username", id)
      .maybeSingle();
    if (!data || !data.active) return null;
    if (!verifyPassword(password, data.password_hash)) return null;
    return { actor: data.username, role: data.role === "mudur" ? "mudur" : "garson" };
  } catch {
    // panel_users tablosu henüz yoksa yalnızca sahip girişi çalışır.
    return null;
  }
}

// ---------- Oturum çerezi ----------

function buildToken(session: PanelSession): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + ttlFor(session.role);
  const payload = `v2.${encodeURIComponent(session.actor)}.${session.role}.${expiresAt}`;
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

function parseToken(token: string): PanelSession | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return null;
  }
  if (!timingSafeStringEqual(sig, expected)) return null;

  const parts = payload.split(".");

  // Yeni format: v2.<actor>.<role>.<expires>
  if (parts[0] === "v2" && parts.length === 4) {
    const expires = Number(parts[3]);
    if (!expires || Date.now() > expires) return null;
    return {
      actor: decodeURIComponent(parts[1]),
      role: parts[2] === "mudur" ? "mudur" : "garson",
    };
  }

  // Eski format: admin.<expires> — sahip/müdür kabul et (geriye dönük uyum).
  if (parts[0] === "admin" && parts.length === 2) {
    const expires = Number(parts[1]);
    if (!expires || Date.now() > expires) return null;
    return { actor: process.env.ADMIN_ID || "sahip", role: "mudur" };
  }

  return null;
}

// Oturumu (yeniden) yazar. Argüman verilirse onu, verilmezse mevcut oturumun
// actor/role'ünü koruyup süreyi uzatır (her işlemde çağrılan tazeleme).
export async function createAdminSession(session?: PanelSession) {
  const store = await cookies();
  let s = session;
  if (!s) {
    const current = store.get(COOKIE_NAME)?.value;
    s =
      (current ? parseToken(current) : null) ?? {
        actor: process.env.ADMIN_ID || "sahip",
        role: "mudur",
      };
  }
  const { token, expiresAt } = buildToken(s);
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getPanelSession(): Promise<PanelSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return parseToken(token);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getPanelSession()) !== null;
}

// Sayfalarda kullanılır — oturum yoksa login'e yönlendirir.
export async function requireAdmin(): Promise<PanelSession> {
  const s = await getPanelSession();
  if (!s) redirect("/admin/login");
  return s;
}

// Yalnızca müdürün görebileceği sayfalarda — garsonu sipariş ekranına atar.
export async function requireManager(): Promise<PanelSession> {
  const s = await requireAdmin();
  if (s.role !== "mudur") redirect("/admin/siparisler");
  return s;
}

// Server Action içinde müdür yetkisi şartı — değilse hata fırlatır (withFlash
// bunu kırmızı toast'a çevirir).
export async function requireManagerAction(): Promise<PanelSession> {
  const s = await getPanelSession();
  if (!s) throw new Error("Oturum bulunamadı.");
  if (s.role !== "mudur") throw new Error("Bu işlem için yönetici yetkisi gerekli.");
  return s;
}

// "Sahip" = ortam değişkenindeki ADMIN_ID ile giren hesap. Panel kullanıcı
// yönetimi ve işlem kaydı yalnızca ona açık; panel_users'taki müdürler göremez.
export function isOwner(session: PanelSession | null): boolean {
  const ownerId = process.env.ADMIN_ID;
  return !!session && !!ownerId && session.role === "mudur" && session.actor === ownerId;
}

export async function requireOwnerAction(): Promise<PanelSession> {
  const s = await getPanelSession();
  if (!s) throw new Error("Oturum bulunamadı.");
  if (!isOwner(s)) throw new Error("Bu işlem yalnızca site sahibine açıktır.");
  return s;
}
