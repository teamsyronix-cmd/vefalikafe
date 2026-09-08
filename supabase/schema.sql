-- Vefalı Kafe QR Menü — veritabanı şeması
-- Bu betik yalnızca sunucu tarafında (service_role anahtarıyla) kullanılacak,
-- bu yüzden RLS kapalı bırakılıyor (anon anahtarla doğrudan erişim yok).

create table if not exists categories (
  id text primary key,
  name_tr text not null,
  name_en text not null,
  emoji text not null default '',
  image_url text,
  sort_order integer not null default 0
);

create table if not exists products (
  id text primary key,
  category_id text not null references categories(id) on delete cascade,
  name_tr text not null,
  name_en text not null,
  description_tr text,
  description_en text,
  price numeric,
  emoji text not null default '',
  image_url text,
  out_of_stock boolean not null default false,
  sort_order integer not null default 0
);

create index if not exists products_category_id_idx on products(category_id);

-- Site ayarları (etkinlik duyurusu vb.) — tek satırlık config tablosu
create table if not exists site_settings (
  id text primary key default 'default',
  announcement_enabled boolean not null default false,
  announcement_title text,
  announcement_message text,
  announcement_image_url text
);

insert into site_settings (id) values ('default')
on conflict (id) do nothing;

-- Duyuru geçmişi (son yayınlananları listelemek ve tekrar yayına almak için)
create table if not exists announcements (
  id bigint generated always as identity primary key,
  title text,
  message text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Menü sayfası üstündeki kayan görsel şeridi (duyuru / etkinlik afişleri)
create table if not exists banner_slides (
  id bigint generated always as identity primary key,
  image_url text not null,
  link_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists banner_slides_sort_idx on banner_slides(sort_order);

-- Üst bilgi şeridi (kayan yazı) satırları
create table if not exists ticker_items (
  id bigint generated always as identity primary key,
  text text not null,
  sort_order integer not null default 0
);

insert into ticker_items (text, sort_order)
select * from (values
  ('Açılış Saatleri: 08:00 – 23:00', 0),
  ('Wi-Fi: Vefali_Misafir', 1),
  ('Bize Google''da yorum bırakmayı unutmayın', 2)
) as v(text, sort_order)
where not exists (select 1 from ticker_items);

-- Menü sayfasında afiş sliderının altında kayan müşteri yorumları
create table if not exists reviews (
  id bigint generated always as identity primary key,
  name text not null,
  stars integer not null default 5,
  text text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists reviews_sort_idx on reviews(sort_order);

insert into reviews (name, stars, text, sort_order)
select * from (values
  ('Elif K.', 5, 'Taze limonata gerçekten günlük sıkılmış. Masalar sürekli siliniyor, mekân tertemiz.', 0),
  ('Burak T.', 5, 'Smash burger efsane, yanındaki patates çıtır çıtırdı. Servis de çok hızlı.', 1),
  ('Zeynep A.', 4, 'Kahveler için geliyorum; flat white kıvamında geliyor, personel güler yüzlü.', 2),
  ('Mert Y.', 5, 'Gözleme sıcacık ve bol malzemeli geldi. Fiyat/performans harika.', 3),
  ('Selin D.', 5, 'Sufle sıcak servis edildi, yanında dondurmayla birlikte tam kıvamında.', 4),
  ('Can Ö.', 5, 'Mutfak dışarıdan görünüyor, hijyene ne kadar önem verdikleri belli.', 5),
  ('Aslı M.', 4, 'Meyveli soda ve Beyoğlu gazozu buz gibiydi, sıcak günde birebir.', 6),
  ('Emre S.', 5, 'Saatlerce çalıştım, kimse rahatsız etmedi, Wi-Fi hızlı. Priz de bol.', 7),
  ('Deniz K.', 5, 'Ayran köpüklü ve gerçek. Kahvaltı tabağı çok doyurucu, her şey taze.', 8),
  ('Gizem B.', 5, 'Masaya gelen her şey kapalı geldi, çalışanlar eldivenli. Temizlik on numara.', 9),
  ('Kaan R.', 5, 'Cool Mango inanılmaz ferahlatıcı, sunumu da çok şık. Bayıldım.', 10),
  ('Nur H.', 4, 'Makarna porsiyonu büyük, sosu ev yapımı gibi. Kesinlikle tekrar geleceğiz.', 11)
) as v(name, stars, text, sort_order)
where not exists (select 1 from reviews);

-- Ürün kampanya/indirim alanları
alter table products add column if not exists campaign_price numeric;
alter table products add column if not exists campaign_active boolean not null default false;

-- Site logosu
alter table site_settings add column if not exists logo_url text;

-- Menü modları (ör. yılbaşı/kar yağışı teması)
alter table site_settings add column if not exists menu_mode text;

-- Bakım modu — açıkken müşteri tarafı menü tamamen kapanır, bakım ekranı gösterilir.
alter table site_settings add column if not exists maintenance boolean not null default false;

-- Admin giriş kayıtları
create table if not exists login_log (
  id bigint generated always as identity primary key,
  logged_in_at timestamptz not null default now()
);

-- Giriş kayıtlarına IP adresi
alter table login_log add column if not exists ip_address text;

-- Panel kullanıcı hesapları (garson / müdür). Ortam değişkenindeki ADMIN_ID /
-- ADMIN_PASSWORD her zaman "müdür" olarak çalışmaya devam eder (kilitlenmeye
-- karşı sahibin sabit girişi); bu tablo ek hesaplar içindir.
create table if not exists panel_users (
  id bigint generated always as identity primary key,
  username text not null unique,
  password_hash text not null,
  role text not null default 'garson' check (role in ('garson', 'mudur')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Panel işlem kaydı — hangi kullanıcının hangi işlemi yaptığı.
create table if not exists panel_activity_log (
  id bigint generated always as identity primary key,
  actor text not null,
  role text,
  action text not null,
  detail text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists panel_activity_log_created_at_idx
  on panel_activity_log(created_at desc);

-- Site ziyaret kayıtları (ana sayfa her açıldığında bir satır eklenir) —
-- admin paneldeki "İstatistik" panelinin veri kaynağı.
create table if not exists site_visits (
  id bigint generated always as identity primary key,
  visited_at timestamptz not null default now()
);

create index if not exists site_visits_visited_at_idx on site_visits(visited_at);

-- Hesap Ayarları paneli — admin e-postası ve profil fotoğrafı
alter table site_settings add column if not exists admin_email text;
alter table site_settings add column if not exists admin_avatar_url text;

-- ============================================================
-- MÜŞTERİ SİPARİŞ SİSTEMİ (giriş yapan müşteriler masadan sipariş verir)
-- ============================================================

-- Müşteri profilleri — Supabase Auth (auth.users) üzerine ek bilgi + yıldız puanı.
create table if not exists customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  stars integer not null default 0,
  created_at timestamptz not null default now()
);

alter table customer_profiles enable row level security;

drop policy if exists "customers can read own profile" on customer_profiles;
create policy "customers can read own profile" on customer_profiles
  for select using (auth.uid() = id);

drop policy if exists "customers can update own profile" on customer_profiles;
create policy "customers can update own profile" on customer_profiles
  for update using (auth.uid() = id);

drop policy if exists "customers can insert own profile" on customer_profiles;
create policy "customers can insert own profile" on customer_profiles
  for insert with check (auth.uid() = id);

-- Siparişler — bir masanın "açık" (active) siparişleri birleşip adisyonu oluşturur,
-- masa kapatılınca hepsi 'paid' olarak işaretlenir.
create table if not exists orders (
  id bigint generated always as identity primary key,
  customer_id uuid not null references auth.users(id) on delete cascade,
  table_number text not null,
  status text not null default 'active', -- active | paid
  total_amount numeric not null default 0,
  reward_redeemed boolean not null default false,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table orders enable row level security;

drop policy if exists "customers can read own orders" on orders;
create policy "customers can read own orders" on orders
  for select using (auth.uid() = customer_id);

drop policy if exists "customers can insert own orders" on orders;
create policy "customers can insert own orders" on orders
  for insert with check (auth.uid() = customer_id);

create index if not exists orders_table_status_idx on orders(table_number, status);

-- Sipariş kalemleri
create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  product_id text not null,
  product_name_tr text not null,
  product_name_en text not null,
  quantity integer not null default 1,
  unit_price numeric not null,
  line_total numeric not null
);

alter table order_items enable row level security;

drop policy if exists "customers can read own order items" on order_items;
create policy "customers can read own order items" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_items.order_id and o.customer_id = auth.uid())
  );

drop policy if exists "customers can insert own order items" on order_items;
create policy "customers can insert own order items" on order_items
  for insert with check (
    exists (select 1 from orders o where o.id = order_items.order_id and o.customer_id = auth.uid())
  );

create index if not exists order_items_order_id_idx on order_items(order_id);

-- Yeni bir auth.users satırı oluşur oluşmaz customer_profiles satırını otomatik
-- oluşturur (SECURITY DEFINER ile RLS'i by-pass eder) — böylece "e-posta onayı
-- bekleniyor" gibi oturumsuz anlarda bile profil satırı asla eksik kalmaz.
create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.customer_profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_customer();

-- Bir siparişin mutfak/servis durumu — "Sipariş Bekliyor" / "Teslim Edildi".
-- Masanın 'active'/'paid' durumundan bağımsız, tek tek siparişler için.
alter table orders add column if not exists delivered boolean not null default false;

-- "stars" ödül kullanıldığında (10'dan) düşer — bu yüzden müşterinin şimdiye
-- kadar TOPLAM kazandığı yıldızı ayrı bir sayaçta tutuyoruz; bu hiç azalmaz,
-- yalnızca kazanıldıkça artar. Mevcut müşteriler için başlangıç değeri olarak
-- şu anki stars'ları kopyalanır (geçmiş veri yoksa en iyi tahmin budur).
alter table customer_profiles add column if not exists lifetime_stars integer not null default 0;
update customer_profiles set lifetime_stars = stars where lifetime_stars = 0;
