"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bookingSchema, type BookingInput } from "@/lib/validations/booking"
import { getAvailableSlots, createBooking } from "@/lib/actions/booking"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react"
import type { Tables } from "@/lib/types/database"

type BookingSlot = Tables<"booking_slots">
type Profile = Tables<"profiles">

const PET_SPECIES = [
  { value: "anjing", label: "Anjing" },
  { value: "kucing", label: "Kucing" },
  { value: "kelinci", label: "Kelinci" },
  { value: "hamster", label: "Hamster" },
  { value: "burung", label: "Burung" },
  { value: "reptil", label: "Reptil" },
  { value: "lainnya", label: "Lainnya" },
]

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [slots, setSlots] = useState<BookingSlot[]>([])
  const [doctors, setDoctors] = useState<Profile[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const { toast } = useToast()

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      slot_id: "",
      owner_name: "",
      owner_phone: "",
      pet_name: "",
      pet_species: "",
      complaint: "",
    },
  })

  // Fetch doctors on mount
  useEffect(() => {
    async function fetchDoctors() {
      const res = await fetch("/api/profiles?role=dokter&is_active=true")
      if (res.ok) {
        const data = await res.json()
        setDoctors(data)
      }
    }
    fetchDoctors()
  }, [])

  // Fetch slots when doctor or date changes
  const fetchSlots = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAvailableSlots(selectedDate || undefined, selectedDoctor || undefined)
      setSlots(data)
    } catch {
      toast({ title: "Gagal memuat slot", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedDoctor, toast])

  useEffect(() => {
    if (selectedDate) fetchSlots()
  }, [selectedDate, selectedDoctor, fetchSlots])

  function canGoNext() {
    if (step === 1) return selectedSlot !== ""
    if (step === 2) {
      const values = form.getValues()
      return values.owner_name && values.owner_phone && values.pet_name && values.pet_species
    }
    return true
  }

  async function handleSubmit() {
    const values = form.getValues()
    values.slot_id = selectedSlot

    const parsed = bookingSchema.safeParse(values)
    if (!parsed.success) {
      toast({ title: "Data tidak valid", description: "Periksa kembali form", variant: "destructive" })
      return
    }

    setSubmitting(true)
    const result = await createBooking(parsed.data)
    setSubmitting(false)

    if (result.error) {
      toast({
        title: "Gagal booking",
        description: typeof result.error === "string" ? result.error : "Terjadi kesalahan",
        variant: "destructive",
      })
      return
    }

    toast({ title: "Booking berhasil!", description: "Kami akan menghubungi Anda segera" })
    setStep(3)
  }

  const selectedSlotData = slots.find((s) => s.id === selectedSlot)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Booking Janji Temu
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Isi data dengan lengkap untuk membuat janji temu dengan dokter hewan kami
          </p>
        </div>
      </section>

      <section className="container py-16">
        {/* Stepper */}
        <div className="mb-12 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : step > s
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              <span className={`text-sm ${step === s ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Pilih Jadwal" : s === 2 ? "Data Pemilik" : "Konfirmasi"}
              </span>
              {s < 3 && <div className="hidden sm:block h-px w-12 bg-border" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="mx-auto max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Pilih Dokter & Tanggal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Dokter (opsional)</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua dokter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua dokter</SelectItem>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedSlot("")
                    }}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </CardContent>
            </Card>

            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Slot Tersedia</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Tidak ada slot tersedia untuk tanggal ini
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                            selectedSlot === slot.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary/50 hover:bg-muted"
                          }`}
                        >
                          {slot.time.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canGoNext()}>
                Lanjut
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto max-w-lg space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Pemilik & Hewan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Nama Pemilik</Label>
                  <Input id="owner_name" placeholder="Nama lengkap" {...form.register("owner_name")} />
                  {form.formState.errors.owner_name && (
                    <p className="text-sm text-destructive">{form.formState.errors.owner_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_phone">Nomor Telepon</Label>
                  <Input id="owner_phone" placeholder="08xxxxxxxxxx" {...form.register("owner_phone")} />
                  {form.formState.errors.owner_phone && (
                    <p className="text-sm text-destructive">{form.formState.errors.owner_phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pet_name">Nama Hewan</Label>
                  <Input id="pet_name" placeholder="Nama hewan" {...form.register("pet_name")} />
                  {form.formState.errors.pet_name && (
                    <p className="text-sm text-destructive">{form.formState.errors.pet_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pet_species">Spesies</Label>
                  <Select
                    value={form.watch("pet_species")}
                    onValueChange={(val) => form.setValue("pet_species", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih spesies" />
                    </SelectTrigger>
                    <SelectContent>
                      {PET_SPECIES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.pet_species && (
                    <p className="text-sm text-destructive">{form.formState.errors.pet_species.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint">Keluhan (opsional)</Label>
                  <Textarea id="complaint" placeholder="Deskripsikan keluhan hewan" {...form.register("complaint")} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Konfirmasi Booking"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <Check className="h-10 w-10 text-success" />
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold">Booking Berhasil!</h2>
            <p className="mt-2 text-muted-foreground">
              Permintaan booking Anda telah kami terima. Kami akan menghubungi Anda melalui nomor telepon yang didaftarkan.
            </p>
            {selectedSlotData && (
              <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-left">
                <p className="text-sm text-muted-foreground">Detail Booking:</p>
                <p className="mt-1 font-medium">
                  {new Date(selectedSlotData.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  - {selectedSlotData.time.slice(0, 5)}
                </p>
              </div>
            )}
            <Button className="mt-8" onClick={() => window.location.href = "/"}>
              Kembali ke Beranda
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
