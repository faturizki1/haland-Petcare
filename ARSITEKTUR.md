# ARSITEKTUR.md — Frontend VetCare Platform

## 1. POSISI DOKUMEN INI

```
SPESIFIKASI.md → apa yang dibangun (fitur, aturan bisnis)
BLUEPRINT.md   → stack & backend (Supabase schema, RLS, deploy)
FRONTEND.md    → cara menulis kode (pola form, state, desain visual)
ARSITEKTUR.md (dokumen ini) → bagaimana semua bagian frontend saling terhubung:
                struktur folder lengkap, alur data, batas tanggung jawab tiap layer
```

---

## 2. STRUKTUR DIREKTORI LENGKAP

```
vetcare-platform/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx                  # navbar publik + footer
│   │   ├── page.tsx                    # landing
│   │   ├── layanan/page.tsx
│   │   ├── dokter/page.tsx
│   │   └── booking/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx                  # layout polos, center card
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # ambil session+role sekali, render sidebar by role
│   │   ├── owner/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── users/[id]/page.tsx
│   │   │   ├── hewan/page.tsx
│   │   │   ├── appointment/page.tsx
│   │   │   ├── rawat-inap/page.tsx
│   │   │   ├── laporan/page.tsx
│   │   │   ├── booking/page.tsx
│   │   │   ├── booking/slots/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── dokter/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── appointment/page.tsx
│   │   │   ├── rekam-medis/page.tsx
│   │   │   ├── rekam-medis/[id]/page.tsx
│   │   │   ├── rawat-inap/page.tsx
│   │   │   ├── rawat-inap/[id]/page.tsx
│   │   │   └── hewan/page.tsx
│   │   ├── staff/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── pos/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   ├── appointment/page.tsx
│   │   │   ├── rawat-inap/page.tsx
│   │   │   ├── rawat-inap/[id]/page.tsx
│   │   │   ├── pengeluaran/page.tsx
│   │   │   └── booking/page.tsx
│   │   └── customer/
│   │       ├── dashboard/page.tsx
│   │       ├── hewan/page.tsx
│   │       ├── hewan/[id]/page.tsx
│   │       ├── rekam-medis/page.tsx
│   │       └── monitoring/page.tsx
│   ├── layout.tsx                      # root layout: font, ThemeProvider, Toaster
│   └── globals.css                     # token warna/font (lihat FRONTEND.md §6)
│
├── components/
│   ├── ui/                             # hasil generate shadcn — JANGAN edit isi logic-nya
│   │   ├── button.tsx, input.tsx, select.tsx, table.tsx, badge.tsx,
│   │   ├── card.tsx, dialog.tsx, form.tsx, toast.tsx, skeleton.tsx, sheet.tsx, ...
│   ├── layout/
│   │   ├── sidebar.tsx                 # terima `role` sebagai prop, render menu sesuai role
│   │   ├── topbar.tsx                  # nama user, notif, logout
│   │   └── mobile-nav.tsx              # Sheet drawer untuk <768px
│   ├── modules/                        # 1 folder per domain bisnis, isi: table + form + detail
│   │   ├── pos/
│   │   │   ├── catalog-grid.tsx
│   │   │   ├── cart.tsx
│   │   │   ├── payment-modal.tsx
│   │   │   └── receipt.tsx
│   │   ├── klinik/
│   │   │   ├── pet-table.tsx, pet-form.tsx, pet-detail.tsx
│   │   │   ├── medical-record-form.tsx, medical-record-detail.tsx
│   │   │   ├── inpatient-card.tsx, monitoring-timeline.tsx, monitoring-log-form.tsx
│   │   ├── inventory/
│   │   │   ├── product-table.tsx, product-form.tsx
│   │   │   ├── stock-mutation-form.tsx, mutation-table.tsx
│   │   │   └── service-table.tsx
│   │   ├── laporan/
│   │   │   ├── summary-cards.tsx, revenue-chart.tsx, breakdown-chart.tsx,
│   │   │   └── top-products-chart.tsx, payment-pie-chart.tsx
│   │   ├── booking/
│   │   │   ├── slot-grid.tsx, booking-form.tsx, booking-table.tsx
│   │   └── users/
│   │       └── user-table.tsx, user-form.tsx
│   └── shared/                         # dipakai lintas modul, wajib reuse (lihat FRONTEND.md §7)
│       ├── pet-search.tsx
│       ├── customer-search.tsx
│       ├── dokter-select.tsx
│       ├── status-badge.tsx
│       ├── empty-state.tsx
│       ├── error-state.tsx
│       ├── table-skeleton.tsx
│       ├── confirm-dialog.tsx
│       ├── image-upload.tsx
│       ├── date-range-picker.tsx
│       └── print-wrapper.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # browser client (Client Component)
│   │   └── server.ts                   # server client (Server Component/Action)
│   ├── actions/                        # SEMUA mutasi data lewat sini ('use server')
│   │   ├── auth.ts
│   │   ├── pets.ts
│   │   ├── appointments.ts
│   │   ├── medical-records.ts
│   │   ├── inpatients.ts
│   │   ├── pos.ts
│   │   ├── inventory.ts
│   │   ├── expenses.ts
│   │   ├── booking.ts
│   │   └── settings.ts
│   ├── validations/                    # 1 file Zod per entitas, dipakai client+server
│   │   ├── auth.ts, pet.ts, appointment.ts, medical-record.ts, inpatient.ts,
│   │   ├── pos.ts, inventory.ts, expense.ts, booking.ts, settings.ts
│   ├── types/
│   │   └── database.ts                 # auto-generated dari Supabase, JANGAN edit manual
│   ├── utils/
│   │   ├── format.ts                   # format rupiah, tanggal, dsb
│   │   ├── invoice.ts                  # generator no. invoice
│   │   ├── csv-export.ts
│   │   └── cn.ts                       # classnames helper (dari shadcn init)
│   └── constants.ts                    # role enum, status enum, dsb (mirror dari DB enum)
│
├── hooks/
│   ├── use-toast.ts                    # dari shadcn
│   ├── use-cart.ts                     # state cart POS (client-side only, tidak persist ke DB sampai submit)
│   └── use-realtime-bookings.ts        # contoh hook realtime (lihat §5)
│
├── middleware.ts                       # proteksi route + refresh session (lihat BLUEPRINT.md §4)
├── netlify.toml
└── .env.local
```

---

## 3. LAPISAN & TANGGUNG JAWAB (jangan dilanggar)

```
┌─────────────────────────────────────────────────────────┐
│ app/**/page.tsx          Server Component                │
│ → Fetch data awal via supabase/server.ts                 │
│ → TIDAK ada interaktivitas, TIDAK ada useState            │
│ → Lempar data sebagai props ke komponen modules/          │
└─────────────────────────┬─────────────────────────────────┘
                           │ props (data awal)
┌─────────────────────────▼─────────────────────────────────┐
│ components/modules/**    Client Component ("use client")  │
│ → Terima initialData via props                            │
│ → Render table/list/form, pegang state UI (modal open,    │
│   filter, sort)                                            │
│ → TIDAK fetch Supabase langsung untuk data awal            │
│ → Panggil lib/actions/* untuk semua mutasi                │
└─────────────────────────┬─────────────────────────────────┘
                           │ memanggil
┌─────────────────────────▼─────────────────────────────────┐
│ lib/actions/**           Server Action ('use server')      │
│ → Validasi via Zod (lib/validations)                       │
│ → Panggil supabase/server.ts untuk insert/update/delete    │
│ → revalidatePath() setelah sukses                          │
│ → Return { success } atau { error } — TIDAK throw ke client│
└─────────────────────────┬─────────────────────────────────┘
                           │ query/mutate
┌─────────────────────────▼─────────────────────────────────┐
│ Supabase (Postgres + RLS)                                  │
│ → Otorisasi final ditegakkan DI SINI lewat RLS policy       │
│ → Bukan tanggung jawab komponen/action untuk cek role       │
└─────────────────────────────────────────────────────────────┘
```

**Aturan tegas:**
- Server Component **tidak pernah** punya `"use client"` dan **tidak pernah** punya `onClick`.
- Client Component **tidak pernah** memanggil `supabase.from(...).insert/update/delete` langsung — selalu lewat `lib/actions/*`. (Boleh `select` langsung hanya untuk kasus realtime/interaktif seperti slot booking live, lihat §5.)
- `lib/actions/*` **tidak pernah** dipanggil dari Server Component lain sebagai pengganti query langsung — actions khusus untuk mutasi, bukan fetch.

---

## 4. ALUR DATA: CONTOH END-TO-END (Tambah Hewan)

```
1. User buka /customer/hewan
   → app/(dashboard)/customer/hewan/page.tsx (Server Component)
   → supabase.from('pets').select() — RLS otomatis filter owner_id = auth.uid()
   → render <PetTable initialData={pets} />

2. User klik "Tambah Hewan"
   → PetTable (client) buka <Dialog> berisi <PetForm />

3. User isi form, submit
   → PetForm validasi client-side via zodResolver(petSchema)
   → panggil createPet(values) dari lib/actions/pets.ts

4. Server Action jalan di server
   → parse ulang dengan petSchema (validasi server-side, tidak percaya client)
   → supabase.from('pets').insert(...) — RLS cek owner_id = auth.uid() saat insert
   → revalidatePath('/customer/hewan')
   → return { success: true }

5. Client terima hasil
   → tampilkan toast sukses, tutup dialog
   → Next.js otomatis re-render data terbaru (karena revalidatePath)
```

Pola ini sama persis untuk semua modul CRUD (appointment, inventory, expenses, dst) — hanya nama tabel & schema yang beda.

---

## 5. KASUS KHUSUS: DATA REALTIME / INTERAKTIF

Beberapa data butuh fetch langsung dari client (bukan cuma initial dari server):

```
- Grid slot booking (STEP 1 booking online) → slot bisa berubah availability
  real-time saat user lain booking duluan
- Status booking di halaman staff → opsional realtime update

Pola:
'use client'
useEffect(() => {
  const channel = supabase
    .channel('booking_slots_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_slots' },
        (payload) => { /* update state lokal */ })
    .subscribe()

  return () => { supabase.removeChannel(channel) }  // WAJIB cleanup
}, [])
```

Ini **satu-satunya** pengecualian di mana Client Component boleh bicara langsung ke Supabase untuk *read*. Untuk *write* tetap wajib lewat Server Action.

---

## 6. STATE MANAGEMENT — TIDAK PAKAI LIBRARY TAMBAHAN

```
- Tidak pakai Redux/Zustand/Jotai — tidak perlu untuk skala aplikasi ini
- State server (data dari DB)     → diserahkan ke Next.js cache + revalidatePath, BUKAN disimpan di state client
- State UI lokal (modal, filter, sort, step wizard) → useState biasa di komponen terkait
- State lintas-komponen sementara (Cart POS)        → custom hook (use-cart.ts) dengan useState di
  level page POS, di-pass via props ke <Cart /> dan <CatalogGrid />, TIDAK perlu Context kecuali
  cart perlu diakses lebih dari 2 level kedalaman komponen
- Form state                       → react-hook-form, jangan duplikat ke useState manual
```

---

## 7. KOMUNIKASI ANTAR ROLE-LAYOUT

```
app/(dashboard)/layout.tsx:
  1. await createClient() → getUser()
  2. Jika !user → redirect /login (cadangan, middleware sudah handle ini duluan)
  3. Fetch profiles row user ini → ambil `role`
  4. Render <Sidebar role={role} /> + <Topbar user={user} />
  5. children dirender di slot konten

Sidebar.tsx menentukan menu yang muncul HANYA dari prop `role` yang diterima
  — bukan dari pengecekan ulang session di tiap item menu.

Proteksi GANDA (defense in depth):
  - middleware.ts  → blok akses route kalau belum login (network level)
  - layout.tsx     → render menu sesuai role (UI level)
  - RLS Supabase   → blok query kalau role tidak berhak (data level, INI YANG FINAL)

Catatan: poin 1-2 (UI) HANYA untuk pengalaman pengguna (sembunyikan menu yang tidak
relevan). Jangan pernah menganggap ini sebagai keamanan — keamanan sesungguhnya
ada di RLS.
```

---

## 8. KONVENSI PENAMAAN FILE & EKSPOR

```
Komponen          : PascalCase nama, kebab-case file → pet-form.tsx exports PetForm
Server Action      : camelCase fungsi → createPet, updatePet, deletePet, getPetById (jika perlu)
Validasi Zod        : namaEntitySchema → petSchema, export juga type PetInput = z.infer<typeof petSchema>
Hook custom         : use-kebab-case.ts → use-cart.ts exports useCart
Satu file = satu tanggung jawab : jangan gabung table+form+detail dalam 1 file kalau >150 baris gabungan
```

---

## 9. CHECKLIST SEBELUM MODUL DIANGGAP SELESAI

```
□ Server Component page fetch data awal, tidak ada "use client" di page.tsx
□ Semua mutasi lewat lib/actions/*, divalidasi Zod di server
□ Loading/error/empty state ada (lihat FRONTEND.md §5)
□ Form pakai react-hook-form + zodResolver
□ Komponen shared (PetSearch dkk) dipakai ulang, tidak duplikat
□ Aksi destruktif pakai <ConfirmDialog />
□ Toast sukses/error terpasang di setiap mutasi
□ Responsive: dicek di 375px, 768px, 1280px
□ RLS policy tabel terkait sudah ada di Supabase (cross-check BLUEPRINT.md §6)
```
