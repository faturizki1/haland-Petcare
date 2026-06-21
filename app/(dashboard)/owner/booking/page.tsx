import { getBookings } from "@/lib/actions/booking"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils/format"
import { StatusBadge } from "@/components/shared/status-badge"
import { BookingActions } from "./booking-actions"
import { CreateSlotForm } from "./create-slot-form"

export default async function OwnerBookingPage() {
  const bookings = await getBookings()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Booking</h1>
        <div className="flex gap-2">
          <CreateSlotForm />
          <Link href="/owner/booking/slots">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Kelola Slot
            </Button>
          </Link>
        </div>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="Belum ada booking"
          description="Belum ada data booking masuk"
          icon={<Calendar className="h-16 w-16" />}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pemilik</TableHead>
                <TableHead>Hewan</TableHead>
                <TableHead>Keluhan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[180px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{formatDate(booking.created_at)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.owner_name}</p>
                      <p className="text-xs text-muted-foreground">{booking.owner_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.pet_name}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({booking.pet_species})
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{booking.complaint ?? "-"}</TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    <BookingActions
                      bookingId={booking.id}
                      status={booking.status}
                    />
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
