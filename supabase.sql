-- =============================
-- DEALER PROFILES TABLE
-- =============================
create table if not exists public.dealer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  shop_name text not null,
  phone text not null,
  city text not null,
  document_url text not null,
  status text default 'pending',
  verified boolean default false,
  created_at timestamp with time zone default now()
);

-- =============================
-- RLS POLICIES
-- =============================
alter table public.dealer_profiles enable row level security;

-- Allow users to insert/update their own profile
create policy "Users can insert own dealer profile" on public.dealer_profiles
  for insert using (auth.uid() = user_id);

create policy "Users can update own dealer profile" on public.dealer_profiles
  for update using (auth.uid() = user_id);

-- Allow everyone to read approved dealers
create policy "Everyone can read approved dealers" on public.dealer_profiles
  for select using (status = 'approved');

-- Allow admin to update all
create policy "Admin can update all dealer profiles" on public.dealer_profiles
  for update using (EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.role = 'admin'));
-- OFFERS TABLE
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references cars(id) on delete cascade,
  seller_id uuid not null,
  buyer_id uuid not null,
  offer_price int not null,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table offers enable row level security;

-- Policies
-- 1. Buyer can insert their offers
create policy "Buyer can insert offers" on offers
  for insert using (auth.uid() = buyer_id);

-- 2. Seller can read offers for their cars
create policy "Seller can read offers for their cars" on offers
  for select using (auth.uid() = seller_id);

-- 3. Seller can update status
create policy "Seller can update offer status" on offers
  for update using (auth.uid() = seller_id);

-- 4. Buyer can read own offers
create policy "Buyer can read own offers" on offers
  for select using (auth.uid() = buyer_id);
