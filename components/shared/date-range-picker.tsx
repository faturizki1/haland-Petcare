"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="pl-9 w-44"
        />
      </div>
      <span className="text-muted-foreground">-</span>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="pl-9 w-44"
        />
      </div>
    </div>
  )
}