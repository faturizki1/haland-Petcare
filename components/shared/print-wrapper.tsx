"use client"

import { ReactNode, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PrintWrapperProps {
  children: ReactNode
  title?: string
}

export function PrintWrapper({ children, title = "Cetak" }: PrintWrapperProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    window.print()
  }

  return (
    <div>
      <div className="no-print mb-4">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          {title}
        </Button>
      </div>
      <div ref={contentRef} className="print-area">
        {children}
      </div>
    </div>
  )
}