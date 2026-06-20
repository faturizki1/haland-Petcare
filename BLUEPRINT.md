**Stack final: Next.js 14 + Supabase (DB+Auth+Storage) + Netlify, tanpa Drizzle (langsung Supabase client + Zod untuk validasi).**

---

# BLUEPRINT.md — VetCare Platform (Minim Config, Minim Error)

## 1. STACK

```
Framework   : Next.js 14 (App Router)
Bahasa      : TypeScript
Database    : Supabase Postgres (managed, gratis)
Auth        : Supabase Auth (email+password, bawaan, JANGAN custom JWT)
Storage     : Supabase Storage (bucket "uploads", gratis 1GB)
Styling     : TailwindCSS + shadcn/ui
Validasi    : Zod
Deploy      : Netlify (auto-deploy dari GitHub)
Package Mgr : npm
```

**Aturan keras:** TIDAK ADA server custom, TIDAK ADA Docker, TIDAK ADA bcrypt/JWT manual, TIDAK ADA Drizzle/ORM tambahan. Semua akses DB lewat `supabase-js` client. Semua proteksi data lewat **Row Level Security (RLS)** di Supabase, bukan middleware custom.

---

## 2. SETUP AWAL (urutan wajib)

```bash
# 1. Buat project Next.js
npx create-next-app@latest vetcare-platform --typescript --tailwind --app --no-src-dir
cd vetcare-platform

# 2. Install dependency wajib
npm install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers
npm install lucide-react recharts date-fns
npx shadcn@latest init
npx shadcn@latest add button input select table card badge dialog form toast skeleton

# 3. Buat akun & project di supabase.com (dashboard, bukan CLI)
#    - Catat: Project URL, anon key (dari Settings > API)

# 4. Buat .env.local
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

**Cline: jangan install Drizzle, jangan install next-auth, jangan bikin folder `api/auth/*` custom. Semua auth pakai `supabase.auth.*`.**

---

## 3. STRUKTUR DIREKTORI

```
vetcare-platform/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # landing
│   │   ├── layanan/page.tsx
│   │   ├── dokter/page.tsx
│   │   └── booking/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               # cek session + role di sini
│   │   ├── owner/...
│   │   ├── dokter/...
│   │   ├── staff/...
│   │   └── customer/...
│   └── layout.tsx
├── components/
│   ├── ui/                          # dari shadcn, jangan edit manual
│   ├── modules/                     # per fitur: pos/, klinik/, inventory/, laporan/, booking/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # browser client
│   │   ├── server.ts                # server component client
│   │   └── middleware.ts            # refresh session
│   ├── validations/                 # schema Zod per entitas
│   └── utils.ts
├── middleware.ts                    # proteksi route by session
├── .env.local
└── netlify.toml
```

---

## 4. SUPABASE CLIENT SETUP (wajib persis seperti ini)

`lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

`middleware.ts` (proteksi otomatis semua route dashboard):
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/owner')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith('/dokter')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith('/staff')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith('/customer')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/owner/:path*', '/dokter/:path*', '/staff/:path*', '/customer/:path*'],
}
```

---

## 5. DATABASE SCHEMA (jalankan di Supabase SQL Editor, sekali, urut dari atas)

```sql
-- ROLE ENUM
create type user_role as enum ('owner', 'dokter', 'staff', 'customer');

-- PROFILES (extend auth.users bawaan Supabase, JANGAN bikin tabel users sendiri)
create table profiles (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  phone text,
  role user_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- Auto-create profile saat user register
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'User'), 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- PETS
create table pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) not null,
  name text not null,
  species text not null,
  breed text,
  birth_date date,
  gender text,
  photo_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- APPOINTMENTS
create table appointments (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) not null,
  doctor_id uuid references profiles(id) not null,
  scheduled_at timestamptz not null,
  status text not null default 'menunggu', -- menunggu|berlangsung|selesai|batal
  complaint text,
  created_at timestamptz default now()
);

-- MEDICAL RECORDS
create table medical_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) not null,
  doctor_id uuid references profiles(id) not null,
  appointment_id uuid references appointments(id),
  diagnosis text not null,
  treatment text,
  prescription text,
  notes text,
  is_visible_customer boolean default true,
  created_at timestamptz default now()
);

-- INPATIENTS (rawat inap)
create table inpatients (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) not null,
  doctor_id uuid references profiles(id) not null,
  cage_number text,
  admitted_at timestamptz default now(),
  discharged_at timestamptz,
  status text default 'rawat', -- rawat|pulang
  notes text
);

create table inpatient_logs (
  id uuid primary key default gen_random_uuid(),
  inpatient_id uuid references inpatients(id) not null,
  condition text not null, -- stabil|perlu_perhatian|kritis
  notes text,
  photo_urls text[],
  is_visible_customer boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- INVENTORY
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references product_categories(id),
  name text not null,
  price numeric(12,2) not null,
  stock integer not null default 0,
  min_stock integer not null default 5,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price numeric(12,2) not null,
  duration_minutes integer,
  doctor_required boolean default false,
  is_active boolean default true
);

create table stock_mutations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  type text not null, -- masuk|keluar|adjustment
  before_qty integer not null,
  change_qty integer not null,
  after_qty integer not null,
  reference text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- POS TRANSACTIONS
create table transactions (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null,
  customer_id uuid references profiles(id),
  cashier_id uuid references profiles(id) not null,
  total numeric(12,2) not null,
  payment_method text not null, -- tunai|qris
  status text default 'selesai', -- selesai|batal
  created_at timestamptz default now()
);

create table transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) not null,
  item_type text not null, -- product|service
  item_id uuid not null,
  item_name text not null,   -- snapshot nama
  price numeric(12,2) not null, -- snapshot harga
  qty integer not null,
  subtotal numeric(12,2) not null
);

-- EXPENSES
create table expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  amount numeric(12,2) not null,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- BOOKING SLOTS & PUBLIC BOOKING
create table booking_slots (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references profiles(id),
  date date not null,
  time time not null,
  is_available boolean default true
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid references booking_slots(id) not null,
  customer_id uuid references profiles(id),
  owner_name text not null,
  owner_phone text not null,
  pet_name text not null,
  pet_species text not null,
  complaint text,
  status text default 'menunggu', -- menunggu|dikonfirmasi|ditolak
  reject_reason text,
  created_at timestamptz default now()
);

-- CLINIC SETTINGS
create table clinic_settings (
  id int primary key default 1,
  clinic_name text default 'VetCare',
  address text,
  phone text,
  open_hours text,
  logo_url text,
  check (id = 1)
);
insert into clinic_settings (id) values (1);
```

---

## 6. ROW LEVEL SECURITY (RLS) — ganti semua "cek role di middleware" jadi ini

```sql
-- Aktifkan RLS di semua tabel
alter table profiles enable row level security;
alter table pets enable row level security;
alter table appointments enable row level security;
alter table medical_records enable row level security;
alter table inpatients enable row level security;
alter table inpatient_logs enable row level security;
alter table products enable row level security;
alter table services enable row level security;
alter table stock_mutations enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table expenses enable row level security;
alter table bookings enable row level security;
alter table booking_slots enable row level security;

-- Helper function: ambil role user yang login
create function my_role() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- PROFILES: lihat sendiri, owner lihat semua
create policy "view own profile" on profiles for select using (id = auth.uid());
create policy "owner view all profiles" on profiles for select using (my_role() = 'owner');
create policy "update own profile" on profiles for update using (id = auth.uid());

-- PETS: customer lihat punya sendiri, staff/dokter/owner lihat semua
create policy "customer own pets" on pets for select using (owner_id = auth.uid());
create policy "staff view all pets" on pets for select using (my_role() in ('owner','dokter','staff'));
create policy "customer manage own pets" on pets for insert with check (owner_id = auth.uid());
create policy "staff manage pets" on pets for all using (my_role() in ('owner','staff'));

-- MEDICAL RECORDS: customer hanya lihat is_visible_customer=true milik hewannya
create policy "customer view own pet records" on medical_records for select
  using (is_visible_customer = true and pet_id in (select id from pets where owner_id = auth.uid()));
create policy "staff manage medical records" on medical_records for all
  using (my_role() in ('owner','dokter'));

-- INPATIENT LOGS: sama polanya
create policy "customer view visible logs" on inpatient_logs for select
  using (is_visible_customer = true and inpatient_id in (
    select i.id from inpatients i join pets p on p.id = i.pet_id where p.owner_id = auth.uid()
  ));
create policy "staff manage inpatient logs" on inpatient_logs for all
  using (my_role() in ('owner','dokter','staff'));

-- INVENTORY & TRANSACTIONS & EXPENSES: hanya staff/owner
create policy "staff manage products" on products for all using (my_role() in ('owner','staff'));
create policy "everyone view active products" on products for select using (is_active = true);
create policy "staff manage transactions" on transactions for all using (my_role() in ('owner','staff'));
create policy "staff manage expenses" on expenses for all using (my_role() in ('owner','staff'));

-- BOOKING: public bisa insert booking & lihat slot tersedia, staff kelola semua
create policy "public view available slots" on booking_slots for select using (is_available = true);
create policy "anyone create booking" on bookings for insert with check (true);
create policy "customer view own bookings" on bookings for select using (customer_id = auth.uid());
create policy "staff manage bookings" on bookings for all using (my_role() in ('owner','staff'));
```

**Catatan untuk Cline:** dengan RLS aktif, query `supabase.from('pets').select()` otomatis ter-filter sesuai role yang login. **Tidak perlu** tulis `if (role !== 'owner') throw` di setiap API call — itu sudah dijamin database, bukan aplikasi. Ini yang membuat error jauh berkurang dibanding custom middleware.

---

## 7. STORAGE (foto hewan, foto monitoring, logo)

Di Supabase Dashboard → Storage → buat 1 bucket bernama `uploads`, set **public**. Upload dari client:

```ts
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(`pets/${petId}/${fileName}`, file)

const { data: { publicUrl } } = supabase.storage
  .from('uploads')
  .getPublicUrl(`pets/${petId}/${fileName}`)
```

Tidak perlu konfigurasi CORS, tidak perlu signed URL, tidak perlu MinIO.

---

## 8. NETLIFY DEPLOY (1x setup, auto setelahnya)

`netlify.toml` di root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Langkah:
1. Push project ke GitHub
2. Buka netlify.com → "Add new site" → "Import from GitHub" → pilih repo
3. Netlify auto-detect Next.js plugin, klik **Deploy**
4. Di Site settings → Environment variables, isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Setiap `git push` ke `main` → auto-deploy ulang

Tidak ada Dockerfile, tidak ada server config, tidak ada CI/CD custom.

---

## 9. URUTAN PENGERJAAN UNTUK CLINE

```
1. Setup project + shadcn + Supabase client (bagian 2 & 4)
2. Jalankan SQL schema + RLS (bagian 5 & 6) di Supabase SQL Editor
3. Halaman login/register pakai supabase.auth.signInWithPassword / signUp
4. Layout dashboard per role (cek profiles.role dari session)
5. Modul Pets + Appointments (CRUD paling dasar)
6. Modul Medical Records + Inpatients
7. Modul Inventory + POS (transaction + transaction_items dalam 1 insert, pakai Supabase transaction via RPC jika perlu atomic)
8. Modul Expenses + Laporan (query agregasi pakai Supabase + recharts)
9. Modul Booking public + slot management
10. Polish: toast, loading skeleton, empty state, responsive
11. Deploy ke Netlify (bagian 8)
```

**Aturan untuk Cline di setiap langkah:** jangan bikin API route custom (`app/api/*`) kecuali untuk hal yang butuh service_role key (admin action seperti nonaktifkan user). Untuk CRUD biasa, panggil `supabase-js` langsung dari Server Component / Server Action. Ini mengurangi lapisan kode dan sumber error.
