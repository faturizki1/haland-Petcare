# FRONTEND.md — Panduan Pengembangan Frontend VetCare Platform

## 1. PRINSIP UTAMA

```
1. Server Component default     → tambah "use client" hanya jika butuh interaktivitas/hook
2. Satu sumber kebenaran tipe   → tipe TypeScript di-generate dari Supabase, jangan tulis manual berulang
3. Form selalu via react-hook-form + zod  → jangan validasi manual di onSubmit
4. Tidak ada fetch di useEffect untuk data awal → pakai Server Component/Server Action
5. Konsisten pakai komponen shadcn/ui yang sudah di-generate → jangan bikin ulang Button/Input/dst
6. Setiap state loading/error/empty WAJIB ditangani, tidak boleh dibiarkan blank
7. Mobile-first kecuali halaman POS (minimum 1024px)
```

---

## 2. GENERATE TIPE DARI SUPABASE (wajib, sekali di awal & tiap schema berubah)

```bash
npx supabase login
npx supabase gen types typescript --project-id <project-id> > lib/types/database.ts
```

Pakai di client:
```ts
import { Database } from '@/lib/types/database'
type Pet = Database['public']['Tables']['pets']['Row']
```

**Aturan untuk Cline:** jangan tulis `interface Pet { ... }` manual. Selalu import dari `database.ts`. Kalau schema berubah, jalankan ulang command di atas — jangan edit `database.ts` manual.

---

## 3. STRUKTUR KOMPONEN PER HALAMAN

```
app/(dashboard)/owner/hewan/page.tsx
  → Server Component: fetch data awal via supabase server client
  → render <PetTable data={pets} />  (client component, terima data sebagai props)

components/modules/klinik/pet-table.tsx
  → "use client"
  → terima data dari props, BUKAN fetch sendiri
  → mutasi (create/update/delete) lewat Server Action, bukan API route
```

Pola wajib:
```tsx
// app/(dashboard)/owner/hewan/page.tsx  — Server Component
import { createClient } from '@/lib/supabase/server'
import { PetTable } from '@/components/modules/klinik/pet-table'

export default async function HewanPage() {
  const supabase = await createClient()
  const { data: pets } = await supabase.from('pets').select('*').order('created_at', { ascending: false })

  return <PetTable initialData={pets ?? []} />
}
```

```tsx
// lib/actions/pets.ts — Server Action, dipanggil dari client component
'use server'
import { createClient } from '@/lib/supabase/server'
import { petSchema } from '@/lib/validations/pet'
import { revalidatePath } from 'next/cache'

export async function createPet(formData: unknown) {
  const parsed = petSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from('pets').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/owner/hewan')
  return { success: true }
}
```

**Kenapa Server Action, bukan API route:** satu lapisan lebih sedikit, tipe otomatis nyambung end-to-end, tidak perlu `fetch('/api/...')` manual yang rawan typo URL.

---

## 4. FORM — POLA WAJIB (semua form pakai ini, tanpa kecuali)

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { petSchema, type PetInput } from '@/lib/validations/pet'
import { createPet } from '@/lib/actions/pets'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

export function PetForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const form = useForm<PetInput>({ resolver: zodResolver(petSchema) })

  async function onSubmit(values: PetInput) {
    setLoading(true)
    const result = await createPet(values)
    setLoading(false)

    if (result.error) {
      toast({ title: 'Gagal menyimpan', description: String(result.error), variant: 'destructive' })
      return
    }
    toast({ title: 'Berhasil disimpan' })
    onSuccess?.()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* field pakai komponen shadcn Form, FormField, dst */}
      <button type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  )
}
```

**Aturan:** setiap field WAJIB punya schema Zod di `lib/validations/`. Tidak ada form tanpa resolver. Tidak ada `e.preventDefault()` manual.

---

## 5. STATE WAJIB DI SETIAP HALAMAN LIST/TABLE

```tsx
{loading && <TableSkeleton rows={5} />}
{!loading && error && <ErrorState message={error} onRetry={refetch} />}
{!loading && !error && data.length === 0 && (
  <EmptyState title="Belum ada hewan" description="Tambahkan data hewan pertama" action={<Button>Tambah Hewan</Button>} />
)}
{!loading && !error && data.length > 0 && <PetTable data={data} />}
```

Tidak boleh ada komponen yang langsung `return <Table data={data}>` tanpa cek tiga state di atas dulu.

---

## 6. DESAIN VISUAL — TOKEN

Klinik hewan butuh kesan **tenang, bersih, dipercaya** — bukan template SaaS generik (bukan ungu-gradient, bukan dashboard admin generik). Arahan:

```
Warna utama   : #2D6A4F (hijau hutan — tenang, medis, alami)
Warna aksen   : #D97706 (amber hangat — untuk CTA/highlight, bukan merah)
Netral        : #F7F5F2 (latar, hangat bukan putih bersih)
                #1C1917 (teks utama)
                #78716C (teks sekunder)
Status        : sukses #16A34A, warning #D97706, bahaya #DC2626, info #0284C7

Font display  : "Fraunces" (serif hangat, untuk landing page/heading besar)
Font UI/body  : "Inter" (untuk seluruh dashboard, form, tabel — keterbacaan tinggi)

Radius        : 8px konsisten (card, button, input) — bukan 0 (terlalu kaku untuk klinik), bukan full-round (terlalu playful)
Shadow        : tipis, hanya untuk card mengambang (modal, dropdown), bukan dekorasi
```

**Landing page (public)** boleh lebih ekspresif — pakai Fraunces besar di hero, foto/ilustrasi hangat. **Dashboard (internal)** harus tenang & efisien — Inter saja, minim warna, fokus ke data.

Jangan pakai: gradient ungu-biru generik, icon emoji berlebihan di UI produksi (emoji di wireframe dokumen sebelumnya hanya placeholder, ganti dengan `lucide-react` icon saat implementasi).

---

## 7. KOMPONEN SHARED — ATURAN PAKAI ULANG

```
<PetSearch />       → dipakai di: POS, booking, appointment form, medical record form
                      SEMUA tempat yang butuh pilih hewan WAJIB pakai komponen ini, jangan bikin select baru

<CustomerSearch />  → sama, untuk pilih customer
<DokterSelect />    → dropdown dokter aktif, dipakai di appointment, booking, jadwal
<StatusBadge />     → warna otomatis berdasar value: "menunggu"=amber, "selesai"=hijau, "batal"=merah, dst — definisikan mapping SEKALI di komponen ini
```

Sebelum bikin komponen baru, cek dulu apakah sudah ada di `components/shared/` atau `components/ui/`. Duplikasi komponen adalah sumber inkonsistensi UI terbesar.

---

## 8. RESPONSIVE

```
Breakpoint Tailwind dipakai apa adanya: sm(640) md(768) lg(1024) xl(1280)

Sidebar dashboard : hidden di <768px, jadi Sheet/drawer (shadcn Sheet)
Tabel              : di <768px, ganti ke Card list (bukan scroll horizontal kalau bisa dihindari)
POS page           : kunci minimum-width 1024px, tampilkan pesan "Buka di layar lebih besar" di bawahnya
Form               : 1 kolom di mobile, 2 kolom di md+
```

---

## 9. PERFORMANCE / HINDARI ERROR UMUM

```
1. Jangan fetch Supabase di Client Component untuk data awal halaman → pakai Server Component
2. Jangan taruh service_role key di kode client manapun → hanya boleh di Server Action/Route Handler
3. Realtime (kalau dipakai, mis. status booking live) → subscribe di useEffect, WAJIB unsubscribe di cleanup
4. Image hewan/foto monitoring → selalu pakai <Image> dari next/image, jangan <img> biasa
5. List panjang (riwayat transaksi, mutasi stok) → pagination di query (.range()), jangan fetch semua lalu slice di client
```

---

## 10. URUTAN BUILD FRONTEND UNTUK CLINE

```
1. Setup shadcn theme (token warna+font di tailwind.config + globals.css)
2. Layout dasar: (public) layout, (dashboard) layout dengan sidebar per role
3. Komponen shared dulu (PetSearch, CustomerSearch, DokterSelect, StatusBadge, EmptyState, dst)
4. Landing page public (boleh paling ekspresif visualnya)
5. Auth pages (login/register) — pakai form pola di atas
6. Per modul, urutan: Server Component page → komponen table/list → form (create/edit) → integrasi toast+loading+empty
7. Terakhir: cek semua breakpoint, cek semua state kosong/error sudah ada
```
