import { getSupabaseAdmin } from "./supabase";

export type OrderItemRow = {
  id: number;
  productId: string;
  nameTr: string;
  nameEn: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderRow = {
  id: number;
  tableNumber: string;
  status: string;
  totalAmount: number;
  rewardRedeemed: boolean;
  delivered: boolean;
  createdAt: string;
  closedAt: string | null;
  customerName: string;
  items: OrderItemRow[];
};

export type TableTab = {
  tableNumber: string;
  orders: OrderRow[];
  total: number;
  oldestCreatedAt: string;
};

function toOrderRow(
  o: Record<string, unknown>,
  items: OrderItemRow[],
  customerName: string,
): OrderRow {
  return {
    id: o.id as number,
    tableNumber: o.table_number as string,
    status: o.status as string,
    totalAmount: Number(o.total_amount),
    rewardRedeemed: Boolean(o.reward_redeemed),
    delivered: Boolean(o.delivered),
    createdAt: o.created_at as string,
    closedAt: (o.closed_at as string) ?? null,
    customerName,
    items,
  };
}

async function fetchOrdersByStatus(status: string): Promise<OrderRow[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });
    if (error || !orders || orders.length === 0) return [];

    const orderIds = orders.map((o) => o.id);
    const customerIds = Array.from(new Set(orders.map((o) => o.customer_id)));

    // orders -> customer_profiles arasında doğrudan bir foreign key olmadığı için
    // (ikisi de ayrı ayrı auth.users'a referans veriyor) PostgREST'in otomatik
    // embed'i çalışmaz — profilleri ayrı sorguyla çekip elle eşliyoruz.
    const [{ data: items }, { data: profiles }] = await Promise.all([
      supabase.from("order_items").select("*").in("order_id", orderIds),
      supabase.from("customer_profiles").select("id, name, email").in("id", customerIds),
    ]);

    const itemsByOrder = new Map<number, OrderItemRow[]>();
    for (const it of items ?? []) {
      const row: OrderItemRow = {
        id: it.id,
        productId: it.product_id,
        nameTr: it.product_name_tr,
        nameEn: it.product_name_en,
        quantity: it.quantity,
        unitPrice: Number(it.unit_price),
        lineTotal: Number(it.line_total),
      };
      const list = itemsByOrder.get(it.order_id) ?? [];
      list.push(row);
      itemsByOrder.set(it.order_id, list);
    }

    const nameById = new Map(
      (profiles ?? []).map((p) => [p.id, (p.name as string) || (p.email as string)]),
    );

    return orders.map((o) =>
      toOrderRow(o, itemsByOrder.get(o.id) ?? [], nameById.get(o.customer_id) || "Müşteri"),
    );
  } catch {
    return [];
  }
}

// Aktif (henüz ödenmemiş) siparişler — masa numarasına göre gruplanır (adisyon).
export async function getActiveTableTabs(): Promise<TableTab[]> {
  const orders = await fetchOrdersByStatus("active");
  const byTable = new Map<string, OrderRow[]>();
  for (const o of orders) {
    const list = byTable.get(o.tableNumber) ?? [];
    list.push(o);
    byTable.set(o.tableNumber, list);
  }
  return Array.from(byTable.entries())
    .map(([tableNumber, tableOrders]) => ({
      tableNumber,
      orders: tableOrders,
      total: tableOrders.reduce((s, o) => s + o.totalAmount, 0),
      oldestCreatedAt: tableOrders.reduce(
        (min, o) => (o.createdAt < min ? o.createdAt : min),
        tableOrders[0].createdAt,
      ),
    }))
    .sort((a, b) => (a.oldestCreatedAt < b.oldestCreatedAt ? -1 : 1));
}

// Kapatılmış (ödenmiş) siparişler — geçmiş listesi.
export async function getOrderHistory(): Promise<OrderRow[]> {
  return fetchOrdersByStatus("paid");
}

// ---------- Kazanç özeti (Sipariş Geçmişi → Kazanç sekmesi) ----------

export type EarningsSummary = {
  today: { total: number; count: number };
  week: { total: number; count: number };
  month: { total: number; count: number };
  allTime: { total: number; count: number };
  // Son 14 günün günlük cirosu (en eskiden en yeniye).
  daily: { label: string; total: number; count: number }[];
};

const EMPTY_EARNINGS: EarningsSummary = {
  today: { total: 0, count: 0 },
  week: { total: 0, count: 0 },
  month: { total: 0, count: 0 },
  allTime: { total: 0, count: 0 },
  daily: [],
};

const IST_DAY_KEY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" });
const IST_DAY_LABEL = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Istanbul",
});

export async function getEarningsSummary(): Promise<EarningsSummary> {
  try {
    const supabase = getSupabaseAdmin();
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Kapanmış (ödenmiş) tüm siparişler — kazanç bunlardan hesaplanır.
    const { data, error } = await supabase
      .from("orders")
      .select("total_amount, closed_at, created_at")
      .eq("status", "paid");
    if (error || !data) return EMPTY_EARNINGS;

    const rows = data.map((o) => ({
      amount: Number(o.total_amount) || 0,
      t: new Date((o.closed_at as string) ?? (o.created_at as string)).getTime(),
    }));

    const todayKey = IST_DAY_KEY.format(new Date(now));
    const sum = (pred: (t: number) => boolean) => {
      let total = 0;
      let count = 0;
      for (const r of rows) {
        if (pred(r.t)) {
          total += r.amount;
          count += 1;
        }
      }
      return { total, count };
    };

    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).getTime();

    const daily: EarningsSummary["daily"] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * DAY);
      const key = IST_DAY_KEY.format(d);
      const dayRows = rows.filter((r) => IST_DAY_KEY.format(new Date(r.t)) === key);
      daily.push({
        label: IST_DAY_LABEL.format(d),
        total: dayRows.reduce((s, r) => s + r.amount, 0),
        count: dayRows.length,
      });
    }

    return {
      today: sum((t) => IST_DAY_KEY.format(new Date(t)) === todayKey),
      week: sum((t) => t > now - 7 * DAY),
      month: sum((t) => t >= monthStart),
      allTime: sum(() => true),
      daily,
    };
  } catch {
    return EMPTY_EARNINGS;
  }
}

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  stars: number;
  createdAt: string;
};

export async function getCustomers(): Promise<CustomerRow[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("customer_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name ?? "",
      email: r.email ?? "",
      stars: r.stars ?? 0,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}
