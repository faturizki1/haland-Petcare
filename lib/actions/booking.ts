"use server"

import { createClient } from "@/lib/supabase/server"
import { bookingSchema, bookingSlotSchema } from "@/lib/validations/booking"
import { revalidatePath } from "next/cache"

export async function getBookings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bookings")
    .select("*, booking_slots:slot_id(doctor_id, date, time)")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAvailableSlots(date?: string, doctorId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("booking_slots")
    .select("*")
    .eq("is_available", true)
    .order("date", { ascending: true })
    .order("time", { ascending: true })

  if (date) query = query.eq("date", date)
  if (doctorId) query = query.eq("doctor_id", doctorId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createBooking(formData: unknown) {
  const parsed = bookingSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from("bookings").insert({
    slot_id: parsed.data.slot_id,
    customer_id: user?.id || null,
    owner_name: parsed.data.owner_name,
    owner_phone: parsed.data.owner_phone,
    pet_name: parsed.data.pet_name,
    pet_species: parsed.data.pet_species,
    complaint: parsed.data.complaint || null,
  })

  if (error) return { error: error.message }

  // Mark slot as unavailable
  await supabase
    .from("booking_slots")
    .update({ is_available: false })
    .eq("id", parsed.data.slot_id)

  revalidatePath("/booking")
  revalidatePath("/owner/booking")
  revalidatePath("/staff/booking")
  return { success: true }
}

export async function confirmBooking(id: string) {
  const supabase = await createClient()

  // Get booking data
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, booking_slots:slot_id(*)")
    .eq("id", id)
    .single()

  if (!booking) return { error: "Booking tidak ditemukan" }

  // Update booking status
  const { error: bookingError } = await supabase
    .from("bookings")
    .update({ status: "dikonfirmasi" })
    .eq("id", id)

  if (bookingError) return { error: bookingError.message }

  // Create appointment from booking
  const slot = booking.booking_slots
  if (slot?.doctor_id) {
    const scheduledAt = `${slot.date}T${slot.time}`
    await supabase.from("appointments").insert({
      pet_id: "", // Will need to be set manually
      doctor_id: slot.doctor_id,
      scheduled_at: new Date(scheduledAt).toISOString(),
      complaint: booking.complaint,
      status: "menunggu",
    })
  }

  revalidatePath("/owner/booking")
  revalidatePath("/staff/booking")
  return { success: true }
}

export async function rejectBooking(id: string, reason: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("bookings")
    .update({ status: "ditolak", reject_reason: reason })
    .eq("id", id)

  if (error) return { error: error.message }

  // Restore slot availability
  const { data: booking } = await supabase
    .from("bookings")
    .select("slot_id")
    .eq("id", id)
    .single()

  if (booking) {
    await supabase
      .from("booking_slots")
      .update({ is_available: true })
      .eq("id", booking.slot_id)
  }

  revalidatePath("/owner/booking")
  revalidatePath("/staff/booking")
  return { success: true }
}

export async function createBookingSlot(formData: unknown) {
  const parsed = bookingSlotSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from("booking_slots").insert({
    doctor_id: parsed.data.doctor_id || null,
    date: parsed.data.date,
    time: parsed.data.time,
  })

  if (error) return { error: error.message }

  revalidatePath("/owner/booking/slots")
  return { success: true }
}