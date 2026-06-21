import { getAvailableSlots, createBookingSlot } from "@/lib/actions/booking"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { CreateSlotForm } from "../create-slot-form"

export default async function OwnerBookingSlotsPage() {
  const slots = await getAvailableSlots()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Kelola Slot Booking</h1>
        <CreateSlotForm />
      </div>

      {slots.length === 0 ? (
        <EmptyState
          title="Belum ada slot"
          description="Belum ada slot booking yang tersedia"
          icon={<Calendar className="h-16 w-16" />}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Dokter</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>{slot.date}</TableCell>
                  <TableCell>{slot.time}</TableCell>
                  <TableCell>{slot.doctor_id ?? "-"}</TableCell>
                  <TableCell>
                    <StatusBadge status={slot.is_available ? "aktif" : "tidak_aktif"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
